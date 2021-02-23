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

    for (const i of graph.nodes[current].children) {
      if (!flag) flag = this.isBelowCurrent(id, i);
    }

    return flag;
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


    for (const a in this.updatedActions) {
      const act = JSON.parse(JSON.stringify(this.updatedActions[a]));

      console.log(this.isBelowCurrent(a, graph.current));

      if (!act || !act.added || graph.nodes[a].label === "Add Plot" || this.isBelowCurrent(a, graph.current))
      {
        continue;
      } 

      if(graph.nodes[a].label === "Filter")
      {
        console.log(this.rootStore.state.filteredOutPoints)
        this.rootStore.state.filteredOutPoints.push(...act.added);

        for(const j of act.removed)
        {
          this.rootStore.state.filteredOutPoints.splice(
            this.rootStore.state.filteredOutPoints.indexOf(j),
            1,
          );
        }
        console.log(this.rootStore.state.filteredOutPoints);

        // this.rootStore.projectStore.filteredOutPoints(...act.added);

        console.log(a, act)

        continue;
      }

      selectedPoints.push(...act.added)
      console.log(selectedPoints)

      console.log(act)



    }

    for (const j of this.rootStore.state.filteredOutPoints) {
      selectedPoints.splice(selectedPoints.indexOf(j), 1);
    }

    console.log(selectedPoints)

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
