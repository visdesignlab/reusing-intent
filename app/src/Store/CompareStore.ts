/* eslint-disable @typescript-eslint/no-unused-vars */
import { makeAutoObservable } from 'mobx';

import { isEmptyOrNull } from '../Utils/isEmpty';

import { RootStore } from './Store';
import { Dataset } from './Types/Dataset';

export class CompareStore {
  rootStore: RootStore;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updatedActions: any;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  isBelowCurrent(id: string, current: string): boolean {
    const graph = this.rootStore.exploreStore.provenance.graph;

    if (graph.nodes[current].children.length === 0) {
      return false;
    } else if (graph.nodes[current].children.includes(id)) {
      return true;
    }

    let flag = false;

    for (const i in graph.nodes[current].children) {
      if (!flag) flag = this.isBelowCurrent(id, i);
    }

    return flag;
  }

  get selectedPointsComparison() {
    let selectedPoints: string[] = [];
    const { plots } = this.rootStore.exploreStore.state;
    const graph = this.rootStore.exploreStore.provenance.graph;

    for (const a in this.updatedActions) {
      const act = JSON.parse(JSON.stringify(this.updatedActions[a]));

      if (!act.added || graph.nodes[a].label === 'Add Plot') {
        continue;
      }

      const points = act.added;
      const removed = act.removed;

      selectedPoints.push(...points);
      // selectedPoints.push(...removed);
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

    return Array.from(new Set(selectedPoints));
  }

  loadedDataset() {
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
    const dataset = this.rootStore.projectStore.comparisonDataset;

    return dataset;
  }
}
