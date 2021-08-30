import { Provenance, ProvenanceGraph } from '@visdesignlab/trrack';

import { Interactions } from '../../types/Interactions';

export type State = {
  interactions: Interactions;
};

export const initState: State = {
  interactions: [],
};

export type ReapplyEvents = 'Add Scatterplot' | 'Freeform Selection' | 'Remove Scatterplot';

export type ReapplyProvenance = Provenance<State, ReapplyEvents>;
export type ReapplyGraph = ProvenanceGraph<ReapplyEvents, void>;
