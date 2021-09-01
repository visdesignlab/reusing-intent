import { Provenance, ProvenanceGraph } from '@visdesignlab/trrack';

import { Interactions } from '../../types/Interactions';

export type State = {
  interactions: Interactions;
};

export const initState: State = {
  interactions: [],
};

export type ReapplyEvents =
  | 'Add Scatterplot'
  | 'Remove Scatterplot'
  | 'Point Selection'
  | 'Point Deselection'
  | 'Add Brush'
  | 'Update Brush'
  | 'Remove Brush'
  | 'Filter'
  | 'Label'
  | 'Aggregate'
  | 'Categorize'
  | 'Algorithmic Selection';

type Status = 'Accepted' | 'Rejected' | 'Unknown';

export type NodeStatus = {
  original_record: string;
  status: { [nodeId: string]: Status };
};

export type ReapplyProvenance = Provenance<State, ReapplyEvents, NodeStatus>;
export type ReapplyGraph = ProvenanceGraph<ReapplyEvents, void>;
