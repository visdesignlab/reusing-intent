import { createAction } from '@visdesignlab/trrack';

import { IntentState } from './IntentState';
import { IntentEvents } from './Types/IntentEvents';
import { Plot, Plots } from './Types/Plot';
import { Prediction } from './Types/Prediction';

const addPlotAction = createAction<IntentState, [Plot], IntentEvents>(
  (state: IntentState, plot: Plot) => {
    state.plots.push(plot);
  },
).setEventType('Add Plot');

const changeDatasetAction = createAction<IntentState, [string], IntentEvents>(
  (state: IntentState, dataset: string) => {
    state.datasetKey = dataset;
  },
).setEventType('Add Plot');

const removePlotAction = createAction<IntentState, [Plot], IntentEvents>(
  (state: IntentState, plot: Plot) => {
    const plots: Plots = [];

    for (let i = 0; i < state.plots.length; ++i) {
      const plt = state.plots[i];

      if (plt.id !== plot.id) {
        plots.push(plt);
      }
    }
    state.plots = plots;
  },
).setEventType('Add Plot');

const pointSelectionAction = createAction<IntentState, [Plot, string[]], IntentEvents>(
  (state: IntentState, plot: Plot, points: string[]) => {
    for (let i = 0; i < state.plots.length; ++i) {
      if (plot.id === state.plots[i].id) {
        const pts = state.plots[i].selectedPoints;
        state.plots[i].selectedPoints = [...pts, ...points];
        break;
      }
    }
  },
).setEventType('Point Selection');

const predictionSelectionAction = createAction<IntentState, [Prediction], IntentEvents>(
  (state: IntentState, prediction: Prediction) => {
    state.plots.forEach((plot) => {
      plot.brushes = {};
      plot.selectedPoints = [];
    });
    state.selectedPrediction = prediction;
  },
).setEventType('Prediction Selection');

const changeCategoryAction = createAction<IntentState, [string], IntentEvents>(
  (state: IntentState, category: string) => {
    state.categoryColumn = category;
  },
).setEventType('Change Category');

const toggleCategoryAction = createAction<IntentState, [boolean, string], IntentEvents>(
  (state: IntentState, show: boolean, category: string) => {
    state.showCategories = show;

    if (!show) return;

    state.categoryColumn = category;
  },
).setEventType('Toggle Category');

export const provenanceActions = {
  addPlotAction,
  changeDatasetAction,
  removePlotAction,
  pointSelectionAction,
  predictionSelectionAction,
  changeCategoryAction,
  toggleCategoryAction,
};
