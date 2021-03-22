import { initProvenance } from '@visdesignlab/trrack';
import firebase from 'firebase';
import 'firebase/database';
import { makeAutoObservable } from 'mobx';
import { createContext } from 'react';

import { initializeFirebase } from '../components/Workflow/Firebase';

import { CompareStore } from './CompareStore';
import { ExploreStore } from './ExploreStore';
import { ProjectStore } from './ProjectStore';
import { provenanceActions } from './ProvenanceActions';
import { StatusRecord } from './Types/Artifacts';
import { IntentEvents } from './Types/IntentEvents';
import { State } from './Types/Interactions';
import { IntentProvenance } from './Types/ProvenanceType';

export class RootStore {
  // Search Params
  debug = true;
  search = '';
  defaultProject = 'cluster';
  loadDefaultDataset = false;
  defaultDatasetKey: string | null = null;
  redirectPath: string | null = null;
  loadedWorkflowId: string | null = null;
  db: firebase.database.Database;

  //
  projectStore: ProjectStore;
  exploreStore: ExploreStore;
  compareStore: CompareStore;
  provenance: IntentProvenance;
  actions = provenanceActions;
  currentNodes: string[];
  bundledNodes: string[][];

  constructor() {
    this.provenance = initProvenance<State, IntentEvents, StatusRecord>(
      { interaction: { type: 'Root' } },
      {
        loadFromUrl: false,
      },
    );

    this.provenance.done();

    this.projectStore = new ProjectStore(this);
    this.exploreStore = new ExploreStore(this);
    this.compareStore = new CompareStore(this);

    this.currentNodes = [];
    this.bundledNodes = [];

    this.db = initializeFirebase().db;

    makeAutoObservable(this, {
      actions: false,
      provenance: false,
    });
  }

  setQueryParams = (search: string) => {
    if (this.search === search) return;
    this.search = search;
    const searchParams = new URLSearchParams(search);
    const debug = searchParams.get('debug');
    const defaultProject = searchParams.get('project');
    const data = searchParams.get('data');
    const redirectPath = searchParams.get('redirect');
    const workflowId = searchParams.get('workflow');

    this.debug = debug ? true : workflowId ? true : false;
    this.defaultProject = defaultProject ? defaultProject : 'cluster';
    this.loadDefaultDataset = data ? true : false;
    this.defaultDatasetKey = data !== 'true' ? data : null;
    this.loadedWorkflowId = workflowId;
    this.redirectPath = workflowId ? 'explore' : redirectPath;
  };

  //   if (this.loadedWorkflowId && this.defaultDatasetKey) {
  //     loadFromFirebase(this.db, this.loadedWorkflowId).then(
  //       (dataSnapshot: firebase.database.DataSnapshot) => {
  //         const graph = dataSnapshot.val().graph;

  //         for (const n in graph.nodes) {
  //           if (!graph.nodes[n].children) {
  //             graph.nodes[n].children = [];
  //           }
  //         }

  //         this.provenance.importProvenanceGraph(graph);

  //         this.exploreStore.addWorkflow(dataSnapshot.val().name);

  //         for (const n in graph.nodes) {
  //           if (isChildNode(graph.nodes[n])) {
  //             this.exploreStore.addToWorkflow(n);
  //           }
  //         }

  //         if (this.defaultDatasetKey) {
  //           this.projectStore.loadDatasetWithReapply(this.defaultDatasetKey);
  //         }

  //         console.log(this.defaultDatasetKey);
  //       },
  //     );
  //   }
  // };
}

const Store = createContext(new RootStore());
export default Store;
