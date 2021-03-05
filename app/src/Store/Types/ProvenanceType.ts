import { Nodes, Provenance, ProvenanceNode } from '@visdesignlab/trrack';

import { VersionStatus } from './Artifacts';
import { IntentEvents } from './IntentEvents';
import { State } from './Interactions';

export type IntentProvenance = Provenance<State, IntentEvents, VersionStatus>;

export type IntentNode = Nodes<State, IntentEvents, VersionStatus>;

export type IntentProvenanceNode = ProvenanceNode<State, IntentEvents, VersionStatus>;
