import { createAction } from '@visdesignlab/trrack';

import { Interaction } from '../../types/Interactions';

import { ReapplyEvents, State } from './../types/Provenance';

function createNewAction() {
  return createAction<State, [Interaction], ReapplyEvents>((state: State, interaction) => {
    state.interaction = interaction;
  }).saveStateMode('Complete');
}

export function addInteractionCreator(event: ReapplyEvents, label: string) {
  return createNewAction().setEventType(event).setLabel(label);
}

export const addScatterplot = createNewAction()
  .setEventType('Add Scatterplot')
  .setLabel('Add Scatterplot');

export const addPCP = createNewAction().setEventType('Add Scatterplot').setLabel('Add PCP');

export const removeScatterplot = createNewAction()
  .setEventType('Remove Scatterplot')
  .setLabel('Remove Scatterplot');

export const addPointSelection = createNewAction()
  .setEventType('Point Selection')
  .setLabel('Select points');

export const addPointDeselection = createNewAction()
  .setEventType('Point Deselection')
  .setLabel('Unselect points');

export const addBrush = createNewAction().setLabel('Brush').setEventType('Add Brush');
export const updateBrush = createNewAction().setLabel('Brush').setEventType('Update Brush');
export const removeBrush = createNewAction().setLabel('Brush').setEventType('Remove Brush');

export const addIntentSelection = createNewAction()
  .setLabel('Intent Selection')
  .setEventType('Algorithmic Selection');

export const addFilter = createNewAction().setLabel('Filter Selections').setEventType('Filter');

export const assignLabel = createNewAction().setLabel('Label Selections').setEventType('Label');

export const assignCategory = createNewAction()
  .setLabel('Categorize Selections')
  .setEventType('Categorize');

export const addAggregate = createNewAction()
  .setLabel('Aggregate Selections')
  .setEventType('Label');

export const replaceAggregate = createNewAction().setLabel('Replace Aggregate');
