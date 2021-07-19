import { Provenance } from '@visdesignlab/trrack';

import { Interactions } from '../../types/Interactions';

export type State = {
  interactions: Interactions;
};

export const initState: State = {
  interactions: [],
};

export type ReapplyEvents = 'Add Scatterplot' | 'Freeform Selection';

export type ReapplyProvenance = Provenance<State, ReapplyEvents>;
