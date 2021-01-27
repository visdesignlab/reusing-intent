import { createAction } from '@visdesignlab/trrack';

import { BrushType, IntentState } from './IntentState';
import { IntentEvents } from './Types/IntentEvents';
import { ExtendedBrush, ExtendedBrushCollection, Plot, Plots } from './Types/Plot';
import { Prediction } from './Types/Prediction';

export const provenanceActions = {
  addPlotAction: createAction<IntentState, [Plot], IntentEvents>(
    (state: IntentState, plot: Plot) => {
      state.plots.push(plot);
    },
  ).setEventType('Add Plot'),
  changeDatasetActon: createAction<IntentState, [string], IntentEvents>(
    (state: IntentState, dataset: string) => {
      state.dataset = dataset;
    },
  ).setEventType('Add Plot'),
  removePlotAction: createAction<IntentState, [Plot], IntentEvents>(
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
  ).setEventType('Add Plot'),
  changeCategoryAction: createAction<IntentState, [string], IntentEvents>(
    (state: IntentState, category: string) => {
      state.categoryColumn = category;
    },
  ).setEventType('Change Category'),
  toggleCategoryAction: createAction<IntentState, [boolean, string[]], IntentEvents>(
    (state: IntentState, show: boolean, categories: string[]) => {
      state.showCategories = show;

      if (categories.length > 0 && state.categoryColumn === '') {
        state.categoryColumn = categories[0];
      }
    },
  ).setEventType('Switch Category Visibility'),
  addPointSelectionAction: createAction<IntentState, [Plot, string[]], IntentEvents>(
    (state: IntentState, plot: Plot, points: string[]) => {
      for (let i = 0; i < state.plots.length; ++i) {
        if (plot.id === state.plots[i].id) {
          const pts = state.plots[i].selectedPoints;
          state.plots[i].selectedPoints = [...pts, ...points];
          break;
        }
      }
    },
  ).setEventType('Point Selection'),
  addPredictionSelection: createAction<IntentState, [Prediction], IntentEvents>(
    (state: IntentState, prediction: Prediction) => {
      state.plots.forEach((plot) => {
        plot.brushes = {};
        plot.selectedPoints = [];
      });
      state.selectedPrediction = prediction;
    },
  ).setEventType('Prediction Selection'),
  removePointSelectionAction: createAction<IntentState, [Plot, string[]], IntentEvents>(
    (state: IntentState, plot: Plot, points: string[]) => {
      for (let i = 0; i < state.plots.length; ++i) {
        if (plot.id === state.plots[i].id) {
          const pts = state.plots[i].selectedPoints;
          state.plots[i].selectedPoints = [...pts, ...points];
          break;
        }
      }
    },
  ).setEventType('Remove Brush'),
  addBrushAction: createAction<
    IntentState,
    [Plot, ExtendedBrushCollection, ExtendedBrush],
    IntentEvents
  >(
    (
      state: IntentState,
      plot: Plot,
      brushCollection: ExtendedBrushCollection,
      _affectedBrush: ExtendedBrush,
    ) => {
      for (let i = 0; i < state.plots.length; ++i) {
        if (plot.id === state.plots[i].id) {
          state.plots[i].brushes = { ...brushCollection };
          break;
        }
      }
    },
  ).setEventType('Add Brush'),
  changeBrushAction: createAction<
    IntentState,
    [Plot, ExtendedBrushCollection, ExtendedBrush],
    IntentEvents
  >(
    (
      state: IntentState,
      plot: Plot,
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
    },
  ).setEventType('Change Selected Brush'),
  removeBrushAction: createAction<IntentState, [Plot, ExtendedBrushCollection], IntentEvents>(
    (state: IntentState, plot: Plot, brushCollection: ExtendedBrushCollection) => {
      for (let i = 0; i < state.plots.length; ++i) {
        if (plot.id === state.plots[i].id) {
          state.plots[i].brushes = { ...brushCollection };
          break;
        }
      }
    },
  ).setEventType('Remove Brush'),
  clearAllAction: createAction<IntentState, [], IntentEvents>((state: IntentState) => {
    for (let i = 0; i < state.plots.length; ++i) {
      state.plots[i].selectedPoints = [];
      state.plots[i].brushes = {};
    }
  }).setEventType('Clear All'),
  changeBrushTypeAction: createAction<IntentState, [BrushType], IntentEvents>(
    (state: IntentState, brushType: BrushType) => {
      state.brushType = brushType;
    },
  ).setEventType('Change Selected Brush'),
  invertSelectionAction: createAction<IntentState, [string[], string[]], IntentEvents>(
    (state: IntentState, currentSelected: string[], all: string[]) => {
      const newSelection = all.filter((a) => !currentSelected.includes(a));

      for (let i = 0; i < state.plots.length; ++i) {
        if (i === 0) {
          state.plots[i].selectedPoints = newSelection;
        } else {
          state.plots[i].selectedPoints = [];
        }
        state.plots[i].brushes = {};
      }
    },
  ).setEventType('Invert'),
};
