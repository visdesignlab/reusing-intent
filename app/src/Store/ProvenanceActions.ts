import { createAction } from '@visdesignlab/trrack';

import { Brush } from '../components/Brush/Types/Brush';

import { IntentEvents } from './Types/IntentEvents';
import { State } from './Types/Interactions';
import { Plot } from './Types/Plot';
import { Prediction } from './Types/Prediction';

const addPlotAction = createAction<State, [Plot], IntentEvents>((state: State, plot: Plot) => {
  state.interaction = {
    type: 'AddPlot',
    plot,
  };
})
  .saveStateMode('Complete')
  .setEventType('Add Plot');

const removePlotAction = createAction<State, [Plot], IntentEvents>((state: State, plot: Plot) => {
  state.interaction = {
    type: 'RemovePlot',
    plot: plot.id,
  };
})
  .saveStateMode('Complete')
  .setEventType('Add Plot');

const pointSelectionAction = createAction<State, [Plot, string[]], IntentEvents>(
  (state: State, plot: Plot, points: string[]) => {
    state.interaction = {
      type: 'PointSelection',
      action: 'Add',
      plot: plot.id,
      selected: points,
    };
  },
)
  .saveStateMode('Complete')
  .setEventType('Point Selection');

const addBrushAction = createAction<State, [Plot, Brush], IntentEvents>(
  (state: State, plot: Plot, brush: Brush) => {
    state.interaction = {
      type: 'Brush',
      action: 'Add',
      plot: plot.id,
      brush,
    };
  },
)
  .saveStateMode('Complete')
  .setEventType('Add Brush');

const updateBrushAction = createAction<State, [Plot, Brush], IntentEvents>(
  (state: State, plot: Plot, brush: Brush) => {
    state.interaction = {
      type: 'Brush',
      action: 'Update',
      plot: plot.id,
      brush,
    };
  },
)
  .saveStateMode('Complete')
  .setEventType('Update Brush');

const removeBrushAction = createAction<State, [Plot, string], IntentEvents>(
  (state: State, plot: Plot, brush: string) => {
    state.interaction = {
      type: 'Brush',
      action: 'Remove',
      plot: plot.id,
      brush,
    };
  },
)
  .saveStateMode('Complete')
  .setEventType('Remove Brush');

const predictionSelectionAction = createAction<State, [Prediction], IntentEvents>(
  (state: State, prediction: Prediction) => {
    state.interaction = {
      type: 'SelectPrediction',
      prediction,
    };
  },
)
  .saveStateMode('Complete')
  .setEventType('Prediction Selection');

const filterAction = createAction<State, ['In' | 'Out'], IntentEvents>(
  (state: State, filterType: 'In' | 'Out') => {
    state.interaction = {
      type: 'Filter',
      filterType,
    };
  },
)
  .saveStateMode('Complete')
  .setEventType('Filter');

export const provenanceActions = {
  addPlotAction,
  removePlotAction,
  filterAction,
  pointSelectionAction,
  predictionSelectionAction,
  addBrushAction,
  updateBrushAction,
  removeBrushAction,
};
