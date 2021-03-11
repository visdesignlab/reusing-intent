/* eslint-disable @typescript-eslint/no-unused-vars */
import { initProvenance } from '@visdesignlab/trrack';
import { makeAutoObservable } from 'mobx';
import { createContext } from 'react';

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
    this.debug = debug ? true : false;
    this.defaultProject = defaultProject ? defaultProject : 'cluster';
    this.loadDefaultDataset = data ? true : false;
    this.defaultDatasetKey = data !== 'true' ? data : null;
    this.redirectPath = redirectPath;
  };
}

const Store = createContext(new RootStore());
export default Store;
