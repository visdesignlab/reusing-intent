import { initProvenance, isChildNode } from '@visdesignlab/trrack';
import { makeAutoObservable, toJS, when } from 'mobx';
import { createContext, useContext } from 'react';
import { QueryClient } from 'react-query';

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

  constructor() {
    this.query = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: Infinity,
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

    makeAutoObservable(this);

    when(
      () => this.opts.showCategories,
      () => {
        this.exploreStore.toggleShowCategories(this.opts.showCategories);
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
