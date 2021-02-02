/* eslint-disable @typescript-eslint/no-unused-vars */
import { isChildNode, NodeID } from '@visdesignlab/trrack';
import Axios, { AxiosResponse } from 'axios';
import { action, makeAutoObservable, toJS } from 'mobx';

import { isEmptyOrNull } from '../Utils/isEmpty';

import { BrushAffectType } from './../components/Brush/Types/Brush';
import { ExtendedBrushCollection } from './IntentState';
import { RootStore } from './Store';
import { Dataset } from './Types/Dataset';
import { InteractionArtifact } from './Types/InteractionArtifact';
import { Interaction, Interactions } from './Types/Interactions';
import { Plot } from './Types/Plot';
import { Prediction, Predictions } from './Types/Prediction';

export class CompareStore {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  get loadedDataset() {
    let dataset = this.rootStore.projectStore.loadedDataset;

    if (!dataset) {
      const dt_str = window.localStorage.getItem('dataset');

      if (!dt_str) throw new Error('Dataset not loaded');

      dataset = JSON.parse(dt_str) as Dataset;

      return dataset;
    }

    window.localStorage.setItem('dataset', JSON.stringify(dataset));

    return dataset;
  }

  get compDataset() {
    let dataset = this.rootStore.projectStore.comparisonDataset;

    if (!dataset) {
      const dt_str = window.localStorage.getItem('dataset');

      if (!dt_str) throw new Error('Dataset not loaded');

      dataset = JSON.parse(dt_str) as Dataset;

      return dataset;
    }

    window.localStorage.setItem('dataset', JSON.stringify(dataset));

    return dataset;
  }
}
