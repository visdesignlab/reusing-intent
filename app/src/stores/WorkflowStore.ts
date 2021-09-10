/* eslint-disable @typescript-eslint/no-explicit-any */
import { isChildNode, ProvenanceGraph } from '@visdesignlab/trrack';
import { IReactionDisposer, makeAutoObservable, reaction, runInAction, toJS } from 'mobx';

import { getAllCustomWorkflows, syncWorkflow } from '../Firebase/firebase';

type WorkflowGraph = ProvenanceGraph<unknown, unknown>;

export type CustomWorkflow = {
  id: string;
  type: 'Custom';
  name: string;
  project: string;
  project_name: string;
  graph: WorkflowGraph;
  order: string[];
};

const defaultGraph: WorkflowGraph = {
  root: '',
  current: '',
  nodes: {},
};

export default class WorkflowStore<T> {
  id: string;
  project: string;
  project_name: string;
  order: string[] = [];
  name: string | null = null;
  graph: T;
  type = 'Default';
  committed: boolean;
  customWorkflows: { [wf_id: string]: CustomWorkflow } = {};
  currentWorkflow: CustomWorkflow | null = null;
  currentWorkflowReaction: IReactionDisposer | null = null;
  isSyncing: 'Not Syncing' | 'Syncing' = 'Not Syncing';
  syncStatus: 'syncing' | 'done' = 'syncing';

  constructor(
    id: string,
    project: string,
    project_name: string,
    graph: T,
    name: string | null = null,
    order: string[] = [],
    type = 'Default',
    committed = false,
  ) {
    this.id = id;
    this.project = project;
    this.name = name;
    this.type = type;
    this.project_name = project_name;
    this.order = order;
    this.graph = graph;
    this.committed = committed;

    makeAutoObservable(this);

    this.getAllCustomWorkflows(project);

    reaction(
      () => toJS(this.graph),
      () => this.sync(),
    );
  }

  getAllCustomWorkflows = async (pid: string) => {
    const wfs = await getAllCustomWorkflows(pid);
    runInAction(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wfDict: { [key: string]: CustomWorkflow } = {};
      wfs.forEach((wf) => {
        wfDict[wf.id] = wf;
      });

      this.customWorkflows = wfDict;
    });
  };

  setCurrentWorkflow = (id?: string) => {
    if (!id) {
      const newWorkflow: CustomWorkflow = {
        id: Date.now().toString(),
        type: 'Custom',
        name: '',
        project: this.project,
        project_name: this.project_name,
        graph: defaultGraph,
        order: [],
      };

      this.currentWorkflow = newWorkflow;
    } else {
      this.currentWorkflow = this.customWorkflows[id];
    }
  };

  setProject = (projectId: string) => {
    this.project = projectId;
  };

  get doesCurrentHaveWorkflow() {
    return Boolean(this.currentWorkflow?.graph.root !== '');
  }

  removeFromWorkflow = (id: string) => {
    if (!this.currentWorkflow) return;

    if (!this.currentWorkflow.graph) return;

    const order = this.currentWorkflow.order;

    this.currentWorkflow.order = order.filter((d) => d !== id);
    delete this.currentWorkflow.graph.nodes[id];
  };

  addToWorkflow = (id: string) => {
    if (!this.currentWorkflow) return;

    const graph: WorkflowGraph = toJS(this.graph as any);

    let current = graph.nodes[id];
    let order: string[] = [];

    // eslint-disable-next-line no-constant-condition
    while (true) {
      order.push(current.id);

      if (!isChildNode(current)) break;

      const parent = graph.nodes[current.parent];
      current = parent;
    }

    order = order.reverse();

    const wfGraph: WorkflowGraph = {
      current: order[order.length - 1],
      root: order[0],
      nodes: {},
    };

    order.forEach((ord) => {
      const node: any = graph.nodes[ord];

      wfGraph.nodes[node.id] = toJS(node);
    });

    this.currentWorkflow.graph = wfGraph;
    this.currentWorkflow.order = order;
  };

  setWorkflowName = (name: string) => {
    if (!this.currentWorkflow) return;

    this.currentWorkflow.name = name;
  };

  updateGraph = (graph: T) => {
    runInAction(() => {
      this.graph = graph;
    });
  };

  toJS = () => {
    return {
      id: this.id,
      project: this.project,
      graph: this.graph,
    };
  };

  toggleSync = () => {
    this.isSyncing = this.isSyncing === 'Syncing' ? 'Not Syncing' : 'Syncing';

    if (this.currentWorkflowReaction) {
      this.currentWorkflowReaction();
    }

    if (this.isSyncing) {
      this.currentWorkflowReaction = reaction(
        () => toJS(this.currentWorkflow),
        (wf) => {
          if (!wf) return;
          this.syncCustomWorkflow(wf);
        },
        {
          fireImmediately: true,
        },
      );
    } else {
      this.currentWorkflowReaction = null;
    }
  };

  syncCustomWorkflow = (wf: CustomWorkflow) => {
    const { id, type, name, graph, project, project_name, order } = wf;

    if (graph.root === '' || graph.current === '' || name === '') return;

    order.forEach((node_id, idx) => {
      graph.nodes[node_id].children =
        idx !== order.length - 1 ? [graph.nodes[order[idx + 1]].id] : [];

      const node = graph.nodes[node_id];

      if (isChildNode(node) && idx !== 0) {
        node.parent = graph.nodes[order[idx - 1]].id;
      }

      graph.nodes[node_id] = node;
    });

    graph.current = order[order.length - 1];
    graph.root = order[0];

    syncWorkflow({
      id,
      name,
      graph,
      type,
      project,
      project_name,
      order,
    });
  };

  sync = () => {
    this.committed = true;
    syncWorkflow({
      id: this.id,
      project: this.project,
      project_name: this.project_name,
      graph: this.graph,
      order: this.order,
      name: this.name as any,
      type: this.type,
    });
  };
}
