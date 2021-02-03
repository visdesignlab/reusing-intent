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
  updatedActions: any;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  get selectedPointsComparison() {
    let selectedPoints: string[] = [];
    const { plots } = this.rootStore.exploreStore.state;

    for (const a in this.updatedActions)
    {
      const act = JSON.parse(JSON.stringify(this.updatedActions[a]));

      if(act.type === "Brush")
      {
        const brushes = act.plot.brushes

        for( const b in brushes)
        {
          const points = brushes[b].changes.added
          const removed = brushes[b].changes.removed;

          console.log(points);
          selectedPoints.push(...points)
          selectedPoints.push(...removed);

        }
      }
      console.log(act);
    }

    Object.values(plots).forEach((plot) => {
      selectedPoints.push(...plot.selectedPoints);

      const brushes = plot.brushes;
      Object.values(brushes).forEach((brush) => {
        if (brush.points) selectedPoints.push(...brush.points);
      });
    });

    const { selectedPrediction } = this.rootStore.exploreStore.state;

    if (!isEmptyOrNull(selectedPrediction))
      selectedPoints = [...selectedPoints, ...selectedPrediction.memberIds];

    
      console.log(new Set(selectedPoints));

    return Array.from(new Set(selectedPoints));
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
