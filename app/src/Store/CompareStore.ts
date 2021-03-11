/* eslint-disable @typescript-eslint/no-unused-vars */
import { makeAutoObservable } from 'mobx';

import { RootStore } from './Store';

export class CompareStore {
  rootStore: RootStore;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updatedActions: any;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  // ##################################################################### //
  // ############################## Getters ############################## //
  // ##################################################################### //

  get compDataset() {
    const dataset = this.rootStore.projectStore.comparisonDataset;

    return dataset;
  }

  get selectedPointsComparison() {
    const t: string[] = [];

    return t;
    // let selectedPoints: string[] = [];
    // const { plots } = this.rootStore.exploreStore.state;
    // const graph = this.rootStore.exploreStore.provenance.graph;

    // Object.values(plots).forEach((plot) => {
    //   selectedPoints.push(...plot.selectedPoints);

    //   const brushes = plot.brushes;
    //   Object.values(brushes).forEach((brush) => {
    //     if (brush.points) selectedPoints.push(...brush.points);
    //   });
    // });

    // const { selectedPrediction } = this.rootStore.exploreStore.state;

    // if (!isEmptyOrNull(selectedPrediction))
    //   selectedPoints = [...selectedPoints, ...selectedPrediction.memberIds];

    // for (const a in this.updatedActions) {
    //   const act = JSON.parse(JSON.stringify(this.updatedActions[a]));

    //   if (
    //     !act ||
    //     !act.added ||
    //     graph.nodes[a].label === 'Add Plot' ||
    //     graph.nodes[a].label === 'Filter' ||
    //     this.isBelowCurrent(a, graph.current)
    //   ) {
    //     continue;
    //   }

    //   selectedPoints.push(...act.added);
    // }

    // for (const j of this.rootStore.state.filterList) {
    //   selectedPoints.splice(selectedPoints.indexOf(j), 1);
    // }

    // return Array.from(new Set(selectedPoints));
  }

  get updatedFilterPoints() {
    const t: string[] = [];

    return t;
    // let arr = this.rootStore.state.filterList;

    // const graph = this.rootStore.exploreStore.provenance.graph;

    // const filterNodes = Object.values(graph.nodes).filter((d) => d.label === 'Filter');

    // if (filterNodes.length > 0 && this.updatedActions) {
    //   filterNodes
    //     .filter((d) => !this.isBelowCurrent(d.id, graph.current))
    //     .forEach((d) => {
    //       const act = this.updatedActions[d.id];
    //       arr.push(...act.added);

    //       arr = arr.filter((d) => !act.removed.includes(d));
    //     });
    // }

    // this.rootStore.state.filterList = arr;

    // return arr;
  }

  // ##################################################################### //
  // ############################## Helpers ############################## //
  // ##################################################################### //

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
}
