import { Provenance, initProvenance, createAction, NodeID } from '@visdesignlab/trrack';
import Axios, { AxiosResponse } from 'axios';
import { action, makeAutoObservable, observable } from 'mobx';
import { createContext } from 'react';

import { getPlotId } from '../Utils/IDGens';

import { Dataset, getColumns } from './Dataset';
import { Plot, Plots, ExtendedBrush, ExtendedBrushCollection } from './Plot';
import { IntentEvents, Predictions } from './Provenance'
import { IntentState, defaultState, BrushType } from './IntentState'


export class Store {
  datasets: string[] = [];
  dataset: string | null = null;
  data: Dataset | null = null;
  provenance: Provenance<IntentState, IntentEvents, Predictions>;
  plots: Plots = [];
  
  provenanceActions = {
    addPlotAction: createAction<IntentState, [Plot], IntentEvents>(
      (state: IntentState, plot: Plot) => {
        state.plots.push(plot);
      },
    ),
  };

  constructor() {
    this.provenance = initProvenance<IntentState, IntentEvents, Predictions>(defaultState);
    makeAutoObservable(this, {
      dataset: observable,
      provenance: observable,
      data: observable,
      plots: observable,
      setDataset: action,
      setDatasets: action,
      addPlot: action,
      reset: action,
    });
  }

  reset() {
    this.plots = [];
    this.data = null;
    this.dataset = null;
    this.provenance = initProvenance<IntentState, IntentEvents, Predictions>(defaultState);
  }

  setDatasets = (datasets: string[]) => {
    this.datasets = datasets;

    if (this.datasets.length > 0 && this.dataset !== this.datasets[0]) {
      this.setDataset(this.datasets[0]);
    }
  };

  setDataset = async (datasetId: string) => {
    Axios.get(`http://127.0.0.1:5000/dataset/${datasetId}`).then(
      action((res: AxiosResponse<Dataset>) => {
        this.reset();
        this.dataset = datasetId;

        this.data = res.data;
        const columns = getColumns(this.data.columns);
        const plot1: Plot = {
          id: getPlotId(),
          x: columns[0],
          y: columns[1],
          brushes: {},
          selectedPoints: [],
        };
        this.addPlot(plot1);

        // const plot2: Plot = {
        //   id: getPlotId(),
        //   x: columns[0],
        //   y: columns[1],
        //   brushes: {},
        //   selectedPoints: [],
        // };
        // this.addPlot(plot2);
      }),
    );
  };

  resetProvenance = () => {
    this.provenance = initProvenance<IntentState, IntentEvents, Predictions>(defaultState);
  };

  addPlot = (plot: Plot): void => {
    this.plots.push(plot);

    this.provenanceActions.addPlotAction.setLabel(`Add plot: ${plot.x} - ${plot.y}`);
    this.provenanceActions.addPlotAction.setEventType('Add Plot');

    this.provenance.apply(this.provenanceActions.addPlotAction(plot));
  };

  changeCategory = (category: string) => {
    const action = createAction<IntentState, any[], IntentEvents>(
      (state: IntentState, category: string) => {
        state.categoryColumn = category;
        //TODO:: wat
        //addDummyInteraction(state);
      },
    );

    action.setLabel(`Category: ${category}`);
    action.setEventType('Change Category');

    this.provenance.apply(action(category));
  };

  toggleCategories = (show: boolean, categories: string[] = []) => {
    const action = createAction<IntentState, any[], IntentEvents>(
      (state: IntentState, show: boolean, categories: string[]) => {
        state.showCategories = show;

        if (categories.length > 0 && state.categoryColumn === '') {
          state.categoryColumn = categories[0];
        }

        //TODO:: wat
        //addDummyInteraction(state);
      },
    );

    action.setLabel(`${show ? 'Show' : 'Hide'} Categories`);
    action.setEventType('Switch Category Visibility');

    this.provenance.apply(action(show, categories));
  };

  removePlot = (plot: Plot) => {
    const action = createAction<IntentState, any[], IntentEvents>(
      (state: IntentState, plot: Plot) => {
        const plots: Plots = [];

        for (let i = 0; i < state.plots.length; ++i) {
          const plt = state.plots[i];

          if (plt.id !== plot.id) {
            plots.push(plt);
          }
        }
        state.plots = plots;

        // removePlotInteraction(state, plot);
      },
    );

    action.setLabel(`Remove plot: ${plot.x} - ${plot.y}`);
    action.setEventType('Add Plot');

    this.provenance.apply(action(plot));
  };

  addPointSelection = (plot: Plot, points: number[], isPaintBrush = false) => {
    if (points.length === 0) return;

    const action = createAction<IntentState, any[], IntentEvents>(
      (state: IntentState, plot: Plot, points: number[]) => {
        for (let i = 0; i < state.plots.length; ++i) {
          if (plot.id === state.plots[i].id) {
            const pts = state.plots[i].selectedPoints;
            state.plots[i].selectedPoints = [...pts, ...points];
            break;
          }
        }
        // addPointSelectionInteraction(state, plot, points);
      },
    );

    action.setLabel(isPaintBrush ? `P. Brush: ${points.length}` : `Add Point Selection`);
    action.setEventType('Point Selection');

    this.provenance.apply(action(plot, points));
  };

  removePointSelection = (plot: Plot, points: number[]) => {
    // addPointSelectionInteraction(state, plot, points);

    const action = createAction<IntentState, any[], IntentEvents>(
      (state: IntentState, plot: Plot, points: number[]) => {
        for (let i = 0; i < state.plots.length; ++i) {
          if (plot.id === state.plots[i].id) {
            const pts = state.plots[i].selectedPoints;
            state.plots[i].selectedPoints = [...pts, ...points];
            break;
          }
        }
      },
    );

    action.setLabel(`Unselect points`);
    action.setEventType('Point Deselection');

    this.provenance.apply(action(plot, points));
  };

  addBrush = (
    plot: Plot,
    brushCollection: ExtendedBrushCollection,
    affectedBrush: ExtendedBrush,
  ) => {
    const pointCount = affectedBrush.points.length;

    const action = createAction<IntentState, any[], IntentEvents>(
      (
        state: IntentState,
        brushCollection: ExtendedBrushCollection,
        _affectedBrush: ExtendedBrush,
      ) => {
        for (let i = 0; i < state.plots.length; ++i) {
          if (plot.id === state.plots[i].id) {
            state.plots[i].brushes = { ...brushCollection };
            break;
          }
        }

        // brushInteraction(state, plot, affectedBrush);
      },
    );

    action.setLabel(`Add R. Brush: ${pointCount} points`);
    action.setEventType('Add Brush');

    this.provenance.apply(action(plot, brushCollection, affectedBrush));
  };

  changeBrush = (
    plot: Plot,
    brushCollection: ExtendedBrushCollection,
    affectedBrush: ExtendedBrush,
  ) => {
    const pointCount = affectedBrush.points.length;

    const action = createAction<IntentState, any[], IntentEvents>(
      (
        state: IntentState,
        brushCollection: ExtendedBrushCollection,
        _affectedBrush: ExtendedBrush,
      ) => {
        let i = 0;

        for (i = 0; i < state.plots.length; ++i) {
          if (plot.id === state.plots[i].id) {
            state.plots[i].brushes = { ...brushCollection };
            break;
          }
        }
        // brushInteraction(state, plot, affectedBrush);
      },
    );

    action.setLabel(`Change R. Brush: ${pointCount}`);
    action.setEventType('Edit Brush');

    this.provenance.apply(action(plot, brushCollection, affectedBrush));
  };

  removeBrush = (
    plot: Plot,
    brushCollection: ExtendedBrushCollection,
    affectedBrush: ExtendedBrush,
  ) => {
    const action = createAction<IntentState, any[], IntentEvents>(
      (
        state: IntentState,
        brushCollection: ExtendedBrushCollection,
        _affectedBrush: ExtendedBrush,
      ) => {
        for (let i = 0; i < state.plots.length; ++i) {
          if (plot.id === state.plots[i].id) {
            state.plots[i].brushes = { ...brushCollection };
            break;
          }
        }

        // removeBrushInteraction(state, plot, affectedBrush);
      },
    );

    action.setLabel(`Remove R. Brush`);
    action.setEventType('Remove Brush');

    this.provenance.apply(action(plot, brushCollection, affectedBrush));
  };

  clearAll = () => {
    const action = createAction<IntentState, any[], IntentEvents>((state: IntentState) => {
      for (let i = 0; i < state.plots.length; ++i) {
        state.plots[i].selectedPoints = [];
        state.plots[i].brushes = {};
      }
      // clearSelectionInteraction(state);
    });

    action.setLabel(`Clear all`);
    action.setEventType('Clear All');

    this.provenance.apply(action());
  };

  changeBrushType = (brushType: BrushType) => {
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

    const action = createAction<IntentState, any[], IntentEvents>(
      (state: IntentState, brushType: BrushType) => {
        state.brushType = brushType;
        // addDummyInteraction(state);
      },
    );

    action.setLabel(message);
    action.setEventType('Switch Brush');

    this.provenance.apply(action(brushType));
  };

  invertSelection = (currentSelected: number[], all: number[]) => {
    const action = createAction<IntentState, any[], IntentEvents>(
      (state: IntentState, currentSelected: number[], all: number[]) => {
        const newSelection = all.filter((a) => !currentSelected.includes(a));

        for (let i = 0; i < state.plots.length; ++i) {
          if (i === 0) {
            state.plots[i].selectedPoints = newSelection;
          } else {
            state.plots[i].selectedPoints = [];
          }
          state.plots[i].brushes = {};
        }

        // addInvertSelectionInteraction(state, newSelection);
      },
    );

    action.setLabel(`Invert selection`);
    action.setEventType('Invert');

    this.provenance.apply(action(currentSelected, all));
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

  goToNode = (id: NodeID) => {
    this.provenance.goToNode(id);
  };
}

const IntentStore = createContext(new Store());
export default IntentStore;
