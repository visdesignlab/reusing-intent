import { createAction } from '@visdesignlab/trrack';

import { BrushType, IntentState } from './IntentState';
import { ExtendedBrush, ExtendedBrushCollection, Plot, Plots } from './Plot';
import { IntentEvents } from './Provenance';

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
  addPointSelectionAction: createAction<IntentState, [Plot, number[]], IntentEvents>(
    (state: IntentState, plot: Plot, points: number[]) => {
      for (let i = 0; i < state.plots.length; ++i) {
        if (plot.id === state.plots[i].id) {
          const pts = state.plots[i].selectedPoints;
          state.plots[i].selectedPoints = [...pts, ...points];
          break;
        }
      }
    },
  ).setEventType('Point Selection'),
  removePointSelectionAction: createAction<IntentState, [Plot, number[]], IntentEvents>(
    (state: IntentState, plot: Plot, points: number[]) => {
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
  invertSelectionAction: createAction<IntentState, [number[], number[]], IntentEvents>(
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
    },
  ).setEventType('Invert'),
  // multiBrushAction: createAction<IntentState, [MultiBrushBehaviour], IntentEvents>(
  //   (state: IntentState, brushBehaviour: MultiBrushBehaviour) => {
  //     state.multiBrushBehaviour = brushBehaviour;

  //     return state;
  //   }
  // ).setEventType("MultiBrush")
};
