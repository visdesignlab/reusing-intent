/* eslint-disable @typescript-eslint/no-unused-vars */
import { makeAutoObservable } from 'mobx';

import { RootStore } from './Store';
import { PCPlots } from './Types/ParallelCoordinatesPlot';

export class PCPStore {
  rootStore: RootStore;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any

  
  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  // ##################################################################### //
  // ############################## Getters ############################## //
  // ##################################################################### //
}
