import { createContext } from 'react';

import { ExploreStore } from './ExploreStore';
import { ProjectStore } from './ProjectStore';
import { provenanceActions } from './ProvenanceActions';

export class RootStore {
  debug = true;
  defaultProject = 'cluster';
  projectStore: ProjectStore;
  exploreStore: ExploreStore;
  //FIX THIS
  provenanceActions: any;
  currentNodes: string[];
  bundledNodes: string[][];

  constructor() {
    this.projectStore = new ProjectStore(this);
    this.exploreStore = new ExploreStore(this);
    this.provenanceActions = provenanceActions
    this.currentNodes = [];
    this.bundledNodes = [];
  }
}

const Store = createContext(new RootStore());
export default Store;
