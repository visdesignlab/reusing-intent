/* eslint-disable @typescript-eslint/no-unused-vars */
import { initProvenance } from '@visdesignlab/trrack';
import { makeAutoObservable } from 'mobx';
import { createContext } from 'react';

import { ExploreStore } from './ExploreStore';
import { defaultState, IntentState } from './IntentState';
import { ProjectStore } from './ProjectStore';
import { provenanceActions } from './ProvenanceActions';
import { IntentEvents } from './Types/IntentEvents';
import { InteractionArtifact } from './Types/InteractionArtifact';
import { IntentProvenance } from './Types/ProvenanceType';
import { CompareStore } from './CompareStore';

export class RootStore {
  debug = true;
  defaultProject = 'cluster';
  projectStore: ProjectStore;
  exploreStore: ExploreStore;
  compareStore: CompareStore
  provenance: IntentProvenance;
  actions = provenanceActions;
  currentNodes: string[];
  bundledNodes: string[][];

  constructor() {
    this.provenance = initProvenance<IntentState, IntentEvents, InteractionArtifact>(defaultState, {
      loadFromUrl: false,
    });

    this.provenance.done();

    this.projectStore = new ProjectStore(this);
    this.exploreStore = new ExploreStore(this);
    this.compareStore= new CompareStore(this);

    this.currentNodes = [];
    this.bundledNodes = [];

    makeAutoObservable(this, {
      actions: false,
      provenance: false,
    });
  }

  get state() {
    const state = this.provenance.getState(this.provenance.current);

    return JSON.parse(JSON.stringify(state)) as IntentState;
  }
}

const Store = createContext(new RootStore());
export default Store;
