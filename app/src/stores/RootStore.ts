import { makeAutoObservable } from 'mobx';
import { createContext, useContext } from 'react';

import ProjectStore from './ProjectStore';

type DebugOpts = {
  debug: 'on' | 'off';
  defaultRoute: string | undefined;
};

export default class RootStore {
  projectStore: ProjectStore;
  opts: DebugOpts;

  constructor() {
    this.projectStore = new ProjectStore(this);
    this.opts = {
      debug: 'off',
      defaultRoute: undefined,
    };

    const opts = localStorage.getItem('debug-opts');

    if (opts !== null) {
      this.opts = JSON.parse(opts);
      localStorage.setItem('debug-opts', JSON.stringify(this.opts));
    }

    makeAutoObservable(this);
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
