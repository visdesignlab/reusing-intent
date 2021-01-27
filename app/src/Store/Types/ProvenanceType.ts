import { Nodes, Provenance, ProvenanceNode } from '@visdesignlab/trrack';

import { IntentState } from './../IntentState';
import { IntentEvents } from './IntentEvents';
import { Predictions } from './Prediction';

export type IntentProvenance = Provenance<IntentState, IntentEvents, Predictions>;

export type IntentNode = Nodes<IntentState, IntentEvents, Predictions>;

export type IntentProvenanceNode = ProvenanceNode<IntentState, IntentEvents, Predictions>;
