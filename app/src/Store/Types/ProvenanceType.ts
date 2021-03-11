import { Nodes, Provenance, ProvenanceNode } from '@visdesignlab/trrack';

import { StatusRecord } from './Artifacts';
import { IntentEvents } from './IntentEvents';
import { State } from './Interactions';

export type IntentProvenance = Provenance<State, IntentEvents, StatusRecord>;

export type IntentNode = Nodes<State, IntentEvents, StatusRecord>;

export type IntentProvenanceNode = ProvenanceNode<State, IntentEvents, StatusRecord>;
