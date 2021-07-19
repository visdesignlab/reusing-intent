import { initProvenance } from '@visdesignlab/trrack';
import { makeAutoObservable, toJS, when } from 'mobx';
import { createContext, useContext } from 'react';

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

  constructor() {
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

    makeAutoObservable(this);

    when(
      () => this.opts.showCategories,
      () => {
        this.exploreStore.showCategories = this.opts.showCategories;
      },
    );
  }

  setDebugOpts = (opts: Partial<DebugOpts>) => {
    this.opts = { ...this.opts, ...opts };
    localStorage.setItem('debug-opts', JSON.stringify(this.opts));
  };
}

export const StoreContext = createContext<RootStore | undefined>(undefined);

export function useStore() {
  const store = useContext(StoreContext);

  if (store === undefined) throw new Error('Store is undefined');

  return store;
}
