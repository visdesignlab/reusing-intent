/* eslint-disable @typescript-eslint/no-unused-vars */
import { getState, initProvenance, NodeID } from '@visdesignlab/trrack';
import Axios, { AxiosResponse } from 'axios';
import { action, makeAutoObservable } from 'mobx';

import { BrushType, defaultState, IntentState } from './IntentState';
import { RootStore } from './Store';
import { IntentEvents } from './Types/IntentEvents';
import { ExtendedBrush, ExtendedBrushCollection, Plot, Plots } from './Types/Plot';
import { Prediction, Predictions } from './Types/Prediction';
import { IntentProvenance } from './Types/ProvenanceType';

export class ExploreStore {
  rootStore: RootStore;
  provenance: IntentProvenance;
  plots: Plots = [];
  showCategories = false;
  categoryColumn = '';
  isLoadingData = false;
  predictions: Predictions = [];
  selectedPrediction: Prediction | null = null;
  showMatchesLegend = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.provenance = initProvenance<IntentState, IntentEvents, Predictions>(defaultState, {
      loadFromUrl: false,
    });
    this.provenance.addGlobalObserver((graph) => {
      if (!graph) return;
      const current = graph.nodes[graph.current];

      Object.entries(graph.nodes).forEach((entry) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [key, val]: [string, any] = entry;

        val['state'] = getState(graph, val);

        graph.nodes[key] = val;
      });
    });

    this.provenance.done();
    makeAutoObservable(this, {
      provenance: false,
    });
  }

  setMatchLegendVisibility = (visible: boolean) => {
    this.showMatchesLegend = visible;
  };

  get currentProject() {
    const curr = this.rootStore.projectStore.currentProject;

    if (!curr) throw new Error();

    return curr;
  }

  get loadedDatasetInfo() {
    const loadedDataset = this.rootStore.projectStore.loadedDatasetKey;

    if (!loadedDataset) throw new Error();

    return loadedDataset;
  }

  setFreeformSelection = (plot: Plot, points: string[]) => {
    this.addPointSelection(plot, points, true);

    this.plots.forEach((plt) => {
      if (plt.id === plot.id)
        plot.selectedPoints = Array.from(new Set([...plot.selectedPoints, ...points]));
    });

    const dimensions: string[] = [];
    Object.values(this.plots).forEach((plt) => {
      dimensions.push(...[plt.x, plt.y]);
    });

    Axios.post(
      `http://127.0.0.1:5000/${this.currentProject.key}/dataset/predict/${this.loadedDatasetInfo}`,
      {
        selections: this.selectedPoints,
        dimensions,
      },
    ).then(
      action((response: AxiosResponse<Predictions>) => {
        const { data = [] } = response;
        this.predictions = data;
      }),
    );
  };

  setPredictionSelection = (prediction: Prediction) => {
    this.selectedPrediction = prediction;
    this.rootStore.provenanceActions.addPredictionSelection.setLabel('Prediction Selection');
    this.provenance.apply(this.rootStore.provenanceActions.addPredictionSelection(prediction));
  };

  setBrush = (plot: Plot, brushes: ExtendedBrushCollection) => {
    this.plots.forEach((plt) => {
      if (plt.id === plot.id) plot.brushes = brushes;
    });
  };

  get selectedPoints() {
    let selectedPoints: string[] = [];

    this.plots.forEach((plot) => {
      selectedPoints.push(...plot.selectedPoints);
    });

    if (this.selectedPrediction)
      selectedPoints = [...selectedPoints, ...this.selectedPrediction.memberIds];

    return Array.from(new Set(selectedPoints));
  }

  get n_plots() {
    return this.plots.length;
  }

  reset = (): void => {
    this.plots = [];
  };

  get dataset() {
    const dataset = this.rootStore.projectStore.loadedDataset;

    if (!dataset) throw new Error('Dataset not loaded');

    return dataset;
  }

  addPlot = (plot: Plot): void => {
    this.plots.push(plot);
    this.rootStore.provenanceActions.addPlotAction.setLabel('Add Plot');
    this.provenance.apply(this.rootStore.provenanceActions.addPlotAction(plot));

    this.rootStore.currentNodes.push(this.provenance.graph.current);
  };

  changeDataset = (dataset: string) => {
    this.rootStore.bundledNodes.push(this.rootStore.currentNodes);
    this.rootStore.currentNodes = [];

    this.rootStore.provenanceActions.changeDatasetActon.setLabel(`Change Dataset: ${dataset}`);
    this.provenance.apply(this.rootStore.provenanceActions.changeDatasetActon(dataset));

    this.rootStore.currentNodes.push(this.provenance.graph.current);
  };

  removePlot = (plot: Plot) => {
    this.plots = this.plots.filter((p) => p.id !== plot.id);

    this.rootStore.provenanceActions.removePlotAction.setLabel(
      `Remove plot: ${plot.x} - ${plot.y}`,
    );
    this.provenance.apply(this.rootStore.provenanceActions.removePlotAction(plot));

    this.rootStore.currentNodes.push(this.provenance.graph.current);
    // this.plots = this.plots.filter((plt) => plt.id !== plot.id);

    // const action = createAction<IntentState, any[], IntentEvents>(
    //   (state: IntentState, plot: Plot) => {
    //     const plots: Plots = [];

    //     for (let i = 0; i < state.plots.length; ++i) {
    //       const plt = state.plots[i];

    //       if (plt.id !== plot.id) {
    //         plots.push(plt);
    //       }
    //     }
    //     state.plots = plots;

    //     // removePlotInteraction(state, plot);
    //   },
    // );

    // action.setLabel(`Remove plot: ${plot.x} - ${plot.y}`);
    // action.setEventType('Add Plot');

    // this.provenance.apply(action(plot));
  };

  changeCategory = (category: string) => {
    this.rootStore.provenanceActions.changeCategoryAction.setLabel(`Category: ${category}`);
    this.provenance.apply(this.rootStore.provenanceActions.changeCategoryAction(category));

    this.rootStore.currentNodes.push(this.provenance.graph.current);
  };

  toggleCategories = (show: boolean, categories: string[] = []) => {
    this.showCategories = show;

    if (this.categoryColumn === '') this.categoryColumn = categories[0];

    this.rootStore.provenanceActions.toggleCategoryAction.setLabel(
      `${show ? 'Show' : 'Hide'} Categories`,
    );
    this.provenance.apply(this.rootStore.provenanceActions.toggleCategoryAction(show, categories));

    this.rootStore.currentNodes.push(this.provenance.graph.current);

    // const action = createAction<IntentState, any[], IntentEvents>(
    //   (state: IntentState, show: boolean, categories: string[]) => {
    //     state.showCategories = show;

    //     if (categories.length > 0 && state.categoryColumn === '') {
    //       state.categoryColumn = categories[0];
    //     }

    //     //TODO:: wat
    //     //addDummyInteraction(state);
    //   },
    // );

    // action.setLabel(`${show ? 'Show' : 'Hide'} Categories`);
    // action.setEventType('Switch Category Visibility');

    // this.provenance.apply(action(show, categories));
  };

  addPointSelection = (plot: Plot, points: string[], isPaintBrush = false) => {
    if (points.length === 0) return;

    this.rootStore.provenanceActions.addPointSelectionAction.setLabel(
      isPaintBrush ? `P. Brush: ${points.length}` : `Add Point Selection`,
    );
    this.provenance.apply(this.rootStore.provenanceActions.addPointSelectionAction(plot, points));

    this.rootStore.currentNodes.push(this.provenance.graph.current);
  };

  removePointSelection = (plot: Plot, points: string[]) => {
    this.rootStore.provenanceActions.removePointSelectionAction.setLabel('Unselect Points');
    this.provenance.apply(
      this.rootStore.provenanceActions.removePointSelectionAction(plot, points),
    );

    this.rootStore.currentNodes.push(this.provenance.graph.current);
    // addPointSelectionInteraction(state, plot, points);
    // const action = createAction<IntentState, any[], IntentEvents>(
    //   (state: IntentState, plot: Plot, points: number[]) => {
    //     for (let i = 0; i < state.plots.length; ++i) {
    //       if (plot.id === state.plots[i].id) {
    //         const pts = state.plots[i].selectedPoints;
    //         state.plots[i].selectedPoints = [...pts, ...points];
    //         break;
    //       }
    //     }
    //   },
    // );
    // action.setLabel(`Unselect points`);
    // action.setEventType('Point Deselection');
    // this.provenance.apply(action(plot, points));
  };

  addBrush = (
    plot: Plot,
    brushCollection: ExtendedBrushCollection,
    affectedBrush: ExtendedBrush,
  ) => {
    this.rootStore.provenanceActions.addBrushAction.setLabel(
      `Add R. Brush: ${affectedBrush.points.length} points`,
    );
    this.provenance.apply(
      this.rootStore.provenanceActions.addBrushAction(plot, brushCollection, affectedBrush),
    );

    this.rootStore.currentNodes.push(this.provenance.graph.current);
    // const pointCount = affectedBrush.points.length;
    // const action = createAction<IntentState, any[], IntentEvents>(
    //   (
    //     state: IntentState,
    //     brushCollection: ExtendedBrushCollection,
    //     _affectedBrush: ExtendedBrush,
    //   ) => {
    //     for (let i = 0; i < state.plots.length; ++i) {
    //       if (plot.id === state.plots[i].id) {
    //         state.plots[i].brushes = { ...brushCollection };
    //         break;
    //       }
    //     }
    //     // brushInteraction(state, plot, affectedBrush);
    //   },
    // );
    // action.setLabel(`Add R. Brush: ${pointCount} points`);
    // action.setEventType('Add Brush');
    // this.provenance.apply(action(plot, brushCollection, affectedBrush));
  };

  changeBrush = (
    plot: Plot,
    brushCollection: ExtendedBrushCollection,
    affectedBrush: ExtendedBrush,
  ): void => {
    this.rootStore.provenanceActions.changeBrushAction.setLabel(
      `Change R. Brush: ${affectedBrush.points.length}`,
    );
    this.provenance.apply(
      this.rootStore.provenanceActions.changeBrushAction(plot, brushCollection, affectedBrush),
    );

    this.rootStore.currentNodes.push(this.provenance.graph.current);
    // const pointCount = affectedBrush.points.length;
    // const action = createAction<IntentState, any[], IntentEvents>(
    //   (
    //     state: IntentState,
    //     brushCollection: ExtendedBrushCollection,
    //     _affectedBrush: ExtendedBrush,
    //   ) => {
    //     let i = 0;
    //     for (i = 0; i < state.plots.length; ++i) {
    //       if (plot.id === state.plots[i].id) {
    //         state.plots[i].brushes = { ...brushCollection };
    //         break;
    //       }
    //     }
    //     // brushInteraction(state, plot, affectedBrush);
    //   },
    // );
    // action.setLabel(`Change R. Brush: ${pointCount}`);
    // action.setEventType('Edit Brush');
    // this.provenance.apply(action(plot, brushCollection, affectedBrush));
  };

  removeBrush = (plot: Plot, brushCollection: ExtendedBrushCollection): void => {
    this.rootStore.provenanceActions.removeBrushAction.setLabel(`Remove R. Brush`);
    this.provenance.apply(
      this.rootStore.provenanceActions.removeBrushAction(plot, brushCollection),
    );

    this.rootStore.currentNodes.push(this.provenance.graph.current);
    // const action = createAction<IntentState, [Plot, ExtendedBrushCollection], IntentEvents>(
    //   (state: IntentState, plot: Plot, brushCollection: ExtendedBrushCollection) => {
    //     for (let i = 0; i < state.plots.length; ++i) {
    //       if (plot.id === state.plots[i].id) {
    //         state.plots[i].brushes = { ...brushCollection };
    //         break;
    //       }
    //     }
    //     // removeBrushInteraction(state, plot, affectedBrush);
    //   },
    // );
    // action.setLabel(`Remove R. Brush`);
    // action.setEventType('Remove Brush');
    // this.provenance.apply(action(plot, brushCollection));
  };

  clearAll = () => {
    this.rootStore.provenanceActions.clearAllAction.setLabel(`Clear All`);
    this.provenance.apply(this.rootStore.provenanceActions.clearAllAction());

    this.rootStore.currentNodes.push(this.provenance.graph.current);
    // const action = createAction<IntentState, any[], IntentEvents>((state: IntentState) => {
    //   for (let i = 0; i < state.plots.length; ++i) {
    //     state.plots[i].selectedPoints = [];
    //     state.plots[i].brushes = {};
    //   }
    //   // clearSelectionInteraction(state);
    // });
    // action.setLabel(`Clear all`);
    // action.setEventType('Clear All');
    // this.provenance.apply(action());
  };

  changeBrushType = (brushType: BrushType): void => {
    let message = '';

    switch (brushType) {
      case 'Rectangular':
      case 'Freeform Small':
      case 'Freeform Medium':
      case 'Freeform Large':
        message = `${brushType === 'Rectangular' ? 'Rectangular' : 'Paint'} brush`;
        break;
      case 'None':
      default:
        message = 'Brushing disabled';
    }

    this.rootStore.provenanceActions.changeBrushTypeAction.setLabel(message);
    this.provenance.apply(this.rootStore.provenanceActions.changeBrushTypeAction(brushType));

    this.rootStore.currentNodes.push(this.provenance.graph.current);
    // let message = '';
    // switch (brushType) {
    //   case 'Rectangular':
    //   case 'Freeform Small':
    //   case 'Freeform Medium':
    //   case 'Freeform Large':
    //     message = `${brushType === 'Rectangular' ? 'Rectangular' : 'Paint'} brush`;
    //     break;
    //   case 'None':
    //   default:
    //     message = 'Brushing disabled';
    // }
    // console.log(message);
    // // const action = createAction<IntentState, any[], IntentEvents>(
    // //   (state: IntentState, brushType: BrushType) => {
    // //     state.brushType = brushType;
    // //     // addDummyInteraction(state);
    // //   },
    // // );
    // // action.setLabel(message);
    // // action.setEventType('Switch Brush');
    // this.provenance.apply(action(brushType));
  };

  invertSelection = (currentSelected: string[], all: string[]): void => {
    this.rootStore.provenanceActions.invertSelectionAction.setLabel('Invert Selection');
    this.provenance.apply(
      this.rootStore.provenanceActions.invertSelectionAction(currentSelected, all),
    );

    this.rootStore.currentNodes.push(this.provenance.graph.current);
    // const action = createAction<IntentState, any[], IntentEvents>(
    //   (state: IntentState, currentSelected: number[], all: number[]) => {
    //     const newSelection = all.filter((a) => !currentSelected.includes(a));
    //     for (let i = 0; i < state.plots.length; ++i) {
    //       if (i === 0) {
    //         state.plots[i].selectedPoints = newSelection;
    //       } else {
    //         state.plots[i].selectedPoints = [];
    //       }
    //       state.plots[i].brushes = {};
    //     }
    //   },
    // );
    // action.setLabel(`Invert selection`);
    // action.setEventType('Invert');
    // this.provenance.apply(action(currentSelected, all));
  };

  //TODO:: Need some extra behaviour before this works
  // lockPrediction = (
  //   pred: Prediction | string,
  //   columnMap: ColumnMap,
  //   currentSelections: number[] = [],
  // ) => {
  //   let predName = '';

  //   if (typeof pred === 'string') {
  //     predName = 'Insight: ' + pred;
  //   } else {
  //     predName = 'Insight: ' + (pred as any).type;
  //   }

  //   const action = createAction<IntentState, any[], IntentEvents>(
  //     (
  //       state: IntentState,
  //       pred: Prediction | string,
  //       columnMap: ColumnMap,
  //       _currentSelections: number[],
  //     ) => {
  //       state.lockedPrediction = pred as any;

  //       if (typeof pred !== 'string') {
  //         const { dims = [] } = pred as PredictionRowType;

  //         let basePlot = state.plots[0];

  //         if (dims.length === 2) {
  //           const dimNames = dims.map((d) => {
  //             const di = Object.entries(columnMap).filter(([k, v]) => v.short === d);

  //             return di[0][0];
  //           });

  //           for (let i = 0; i < state.plots.length; ++i) {
  //             const p = state.plots[i];

  //             if (dimNames.includes(p.x) && dimNames.includes(p.y)) {
  //               basePlot = p;
  //               break;
  //             }
  //           }
  //         }

  //         const newSelection = pred.dataIds || [];

  //         for (let i = 0; i < state.plots.length; ++i) {
  //           if (state.plots[i].id === basePlot.id) state.plots[i].selectedPoints = newSelection;
  //           else state.plots[i].selectedPoints = [];
  //           state.plots[i].brushes = {};
  //         }

  //         // clearSelectionInteraction(state);
  //         // addPointSelectionInteraction(state, basePlot, newSelection);
  //         // addDummyInteractionTrigger(state);

  //         state.turnedPrediction = pred.intent;
  //       }
  //     },
  //   );

  //   action.setLabel(predName);
  //   action.setEventType('Lock Prediction');

  //   this.provenance.apply(action(pred, columnMap, currentSelections));
  // };

  //TODO:: Need MultiBrushVehavior for this
  // toggleMultiBrushBehaviour = (brushBehaviour: MultiBrushBehaviour) {

  //   const action = createAction<IntentState, any[], IntentEvents>(
  //     (state: IntentState, brushBehaviour: MultiBrushBehaviour) => {
  //       state.multiBrushBehaviour = brushBehaviour;
  //       addDummyInteraction(state);

  //       return state;
  //     }
  //   );

  //   action.setLabel(`${brushBehaviour} selections`);
  //   action.setEventType("MultiBrush");

  //   this.provenance.apply(action(brushBehaviour));
  // }

  goToNode = (id: NodeID): void => {
    this.provenance.goToNode(id);
  };
}
