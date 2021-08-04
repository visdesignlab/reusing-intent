import { createAction } from '@visdesignlab/trrack';

import { Interaction } from '../../types/Interactions';

import { ReapplyEvents, State } from './../types/Provenance';

function createNewAction() {
  return createAction<State, [Interaction], ReapplyEvents>((state: State, interaction) => {
    state.interactions.push(interaction);
  }).saveStateMode('Complete');
}

export const addScatterplot = createNewAction()
  .setEventType('Add Scatterplot')
  .setLabel('Add Scatterplot');

export const removeScatterplot = createNewAction()
  .setEventType('Remove Scatterplot')
  .setLabel('Remove Scatterplot');

export const addPointSelection = createNewAction()
  .setEventType('Freeform Selection')
  .setLabel('Select points');

export const addPointDeselection = createNewAction()
  .setEventType('Freeform Selection')
  .setLabel('Unselect points');

export const addBrush = createNewAction().setLabel('Brush');
export const updateBrush = createNewAction().setLabel('Brush');
export const removeBrush = createNewAction().setLabel('Brush');

export const addIntentSelection = createNewAction().setLabel('Intent Selection');

export const addFilter = createNewAction().setLabel('Filter Selections');

export const assignLabel = createNewAction().setLabel('Label Selections');

export const assignCategory = createNewAction().setLabel('Categorize Selections');

export const addAggregate = createNewAction().setLabel('Aggregate Selections');

export const replaceAggregate = createNewAction().setLabel('Replace Aggregate');
