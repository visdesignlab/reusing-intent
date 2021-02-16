import { createAction } from '@visdesignlab/trrack';

import { BrushType, ExtendedBrushCollection, IntentState } from './IntentState';
import { IntentEvents } from './Types/IntentEvents';
import { Plot } from './Types/Plot';
import { Prediction } from './Types/Prediction';

const addPlotAction = createAction<IntentState, [Plot], IntentEvents>(
  (state: IntentState, plot: Plot) => {
    state.plots[plot.id] = plot;
  },
).setEventType('Add Plot');

const changeDatasetAction = createAction<IntentState, [string], IntentEvents>(
  (state: IntentState, dataset: string) => {
    state.datasetKey = dataset;
  },
).setEventType('Add Plot');

const removePlotAction = createAction<IntentState, [Plot], IntentEvents>(
  (state: IntentState, plot: Plot) => {
    const { plots } = state;

    delete plots[plot.id];

    state.plots = plots;
  },
).setEventType('Add Plot');

const filterAction = createAction<IntentState, [], IntentEvents>(
  (state: IntentState) => {
    return state;
  },
).setEventType('Filter');

const pointSelectionAction = createAction<IntentState, [Plot, string[]], IntentEvents>(
  (state: IntentState, plot: Plot, points: string[]) => {
    plot.selectedPoints = [...new Set([...plot.selectedPoints, ...points])];
    state.plots[plot.id] = plot;
  },
).setEventType('Point Selection');

const predictionSelectionAction = createAction<IntentState, [Prediction], IntentEvents>(
  (state: IntentState, prediction: Prediction) => {
    Object.values(state.plots).forEach((plot) => {
      plot.brushes = {};
      plot.selectedPoints = [];
      state.plots[plot.id] = plot;
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

const addBrushAction = createAction<IntentState, [Plot, ExtendedBrushCollection], IntentEvents>(
  (state: IntentState, plot: Plot, brushes: ExtendedBrushCollection) => {
    plot.brushes = brushes;
    state.plots[plot.id] = plot;
  },
).setEventType('Add Brush');

const updateBrushAction = createAction<IntentState, [Plot, ExtendedBrushCollection], IntentEvents>(
  (state: IntentState, plot: Plot, brushes: ExtendedBrushCollection) => {
    plot.brushes = brushes;
    state.plots[plot.id] = plot;
  },
).setEventType('Update Brush');

const removeBrushAction = createAction<IntentState, [Plot, ExtendedBrushCollection], IntentEvents>(
  (state: IntentState, plot: Plot, brushes: ExtendedBrushCollection) => {
    plot.brushes = brushes;
    state.plots[plot.id] = plot;
  },
).setEventType('Remove Brush');

const switchBrushTypeAction = createAction<IntentState, [BrushType], IntentEvents>(
  (state: IntentState, type: BrushType) => {
    state.brushType = type;
  },
).setEventType('Change Brush Type');

export const provenanceActions = {
  addPlotAction,
  changeDatasetAction,
  removePlotAction,
  filterAction,
  pointSelectionAction,
  predictionSelectionAction,
  changeCategoryAction,
  toggleCategoryAction,
  addBrushAction,
  updateBrushAction,
  removeBrushAction,
  switchBrushTypeAction,
};
