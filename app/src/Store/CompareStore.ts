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

    if (graph.nodes[current].children.length === 0 || id === current) {
      return false;
    } else if (graph.nodes[current].children.includes(id)) {
      return true;
    }

    let flag = false;

    for (const i of graph.nodes[current].children) {
      if (!flag) flag = this.isBelowCurrent(id, i);
    }

    return flag;
  }

  get updatedFilterPoints() {
    let arr = this.rootStore.state.filteredOutPoints;

    console.log(arr);

    const graph = this.rootStore.exploreStore.provenance.graph;

    const filterNodes = Object.values(graph.nodes).filter(d => d.label === "Filter")

    if(filterNodes.length > 0 && this.updatedActions)
    {
      filterNodes.filter(d => !this.isBelowCurrent(d.id, graph.current)).forEach(d => {
        const act = this.updatedActions[d.id]
        arr.push(...act.added);

        arr = arr.filter(d => !act.removed.includes(d))
      })
    }

    console.log(arr);
    this.rootStore.state.filteredOutPoints = arr;

    return arr;
  }

  get selectedPointsComparison() {
    let selectedPoints: string[] = [];
    const { plots } = this.rootStore.exploreStore.state;
    const graph = this.rootStore.exploreStore.provenance.graph;

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

    console.log('SELECTED POINTS 1 HERE', selectedPoints);


    for (const a in this.updatedActions) {
      const act = JSON.parse(JSON.stringify(this.updatedActions[a]));

      console.log(this.isBelowCurrent(a, graph.current));

      if (!act || !act.added || graph.nodes[a].label === "Add Plot" || graph.nodes[a].label === "Filter" || this.isBelowCurrent(a, graph.current))
      {
        continue;
      } 

      selectedPoints.push(...act.added)
    }

    for (const j of this.rootStore.state.filteredOutPoints) {
      selectedPoints.splice(selectedPoints.indexOf(j), 1);
    }

    console.log("SELECTED POINTS 2 HERE", selectedPoints)

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
