import { Nodes, Provenance, ProvenanceNode } from '@visdesignlab/trrack';

import { IntentState } from './../IntentState';
import { IntentEvents } from './IntentEvents';
import { InteractionArtifact } from './InteractionArtifact';

export type IntentProvenance = Provenance<IntentState, IntentEvents, InteractionArtifact>;

export type IntentNode = Nodes<IntentState, IntentEvents, InteractionArtifact>;

export type IntentProvenanceNode = ProvenanceNode<IntentState, IntentEvents, InteractionArtifact>;
