import { makeAutoObservable, when } from 'mobx';
import { createContext, useContext } from 'react';
import { QueryClient } from 'react-query';

import ExploreStore from './ExploreStore';
import ProjectStore from './ProjectStore';

type DebugOpts = {
  debug: 'on' | 'off';
  showCategories: boolean;
  goToExplore: boolean;
};

export default class RootStore {
  projectStore: ProjectStore;
  exploreStore: ExploreStore;
  opts: DebugOpts;
  query: QueryClient;

  constructor() {
    this.query = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: Infinity,
          cacheTime: Infinity,
        },
      },
    });

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

    makeAutoObservable(this);

    when(
      () => this.opts.showCategories,
      () => {
        this.exploreStore.toggleShowCategories(this.opts.showCategories);
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

export const store = new RootStore();
