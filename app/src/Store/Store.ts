import { createContext } from 'react';

import { ExploreStore } from './ExploreStore';
import { ProjectStore } from './ProjectStore';

export class RootStore {
  debug = true;
  defaultProject = 'cluster';
  projectStore: ProjectStore;
  exploreStore: ExploreStore;

  constructor() {
    this.projectStore = new ProjectStore(this);
    this.exploreStore = new ExploreStore(this);
  }
}

const Store = createContext(new RootStore());
export default Store;
