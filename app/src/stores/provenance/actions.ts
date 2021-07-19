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

export const addPointSelection = createNewAction()
  .setEventType('Freeform Selection')
  .setLabel('Select points');

export const addPointDeselection = createNewAction()
  .setEventType('Freeform Selection')
  .setLabel('Unselect points');

export const addBrush = createNewAction().setLabel('Brush');
export const updateBrush = createNewAction().setLabel('Brush');
export const removeBrush = createNewAction().setLabel('Brush');
