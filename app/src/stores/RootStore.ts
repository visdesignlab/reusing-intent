import { initProvenance, isChildNode } from '@visdesignlab/trrack';
import { action, makeAutoObservable, reaction, toJS, when } from 'mobx';
import { createContext, useContext } from 'react';
import { QueryClient } from 'react-query';

import { loadWorkflowFromFirebase } from '../Firebase/firebase';

import ExploreStore from './ExploreStore';
import ProjectStore from './ProjectStore';
import { initState, ReapplyProvenance } from './types/Provenance';

type DebugOpts = {
  debug: 'on' | 'off';
  showCategories: boolean;
  goToExplore: boolean;
};

export default class RootStore {
  projectStore: ProjectStore;
  exploreStore: ExploreStore;
  opts: DebugOpts;
  provenance: ReapplyProvenance;
  query: QueryClient;
  workflowId: string | null = null;

  constructor() {
    this.query = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: Infinity,
          cacheTime: Infinity,
        },
      },
    });

    this.provenance = initProvenance(initState);
    this.provenance.done();

    this.opts = {
      debug: 'off',
      goToExplore: false,
      showCategories: false,
    };

    const opts = localStorage.getItem('debug-opts');

    if (opts !== null) {
      this.opts = JSON.parse(opts);
      localStorage.setItem('debug-opts', JSON.stringify(this.opts));
    }

    this.projectStore = new ProjectStore(this);
    this.exploreStore = new ExploreStore(this);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).printProvenanceTable = (keysToShow: string[] = ['id', 'label']) => {
      // eslint-disable-next-line no-console
      console.table(Object.values(toJS(this.provenance.graph.nodes)), keysToShow);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).printProvenance = () => {
      // eslint-disable-next-line no-console
      console.log(this.provenance.state);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).printRawProvenance = () => {
      // eslint-disable-next-line no-console
      console.log(toJS(this.provenance.graph));
    };

    makeAutoObservable(this, {
      setWorkflowId: action,
      loadWorkflow: action,
    });

    when(
      () => this.opts.showCategories,
      () => {
        this.exploreStore.toggleShowCategories(this.opts.showCategories);
      },
    );

    reaction(
      () => this.workflowId,
      (workflowId) => {
        this.loadWorkflow(workflowId);
      },
    );
  }

  get isAtRoot() {
    const {
      current,
      graph: { root },
    } = this.provenance;

    if (isChildNode(current)) {
      return current.parent === root;
    }

    return true;
  }

  get isAtLatest() {
    const { current } = this.provenance;

    return current.children.length === 0;
  }

  setWorkflowId = (id: string) => {
    if (id === this.workflowId) return;
    this.workflowId = id;
  };

  setDebugOpts = (opts: Partial<DebugOpts>) => {
    this.opts = { ...this.opts, ...opts };
    localStorage.setItem('debug-opts', JSON.stringify(this.opts));
  };

  loadWorkflow = async (id: string | null) => {
    if (!id) return;
    const { project } = await loadWorkflowFromFirebase('ABC');
    this.projectStore.setCurrentProject(project);
    const prj = this.projectStore.project;

    if (prj) {
      const { datasets = [] } = prj;

      if (datasets.length > 0) this.projectStore.setDatasetId(datasets[0].id);
    }
  };
}

export const StoreContext = createContext<RootStore | undefined>(undefined);

export function useStore() {
  const store = useContext(StoreContext);

  if (store === undefined) throw new Error('Store is undefined');

  return store;
}

export const store = new RootStore();
