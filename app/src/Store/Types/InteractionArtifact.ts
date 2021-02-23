import { Interaction } from './Interactions';
import { Predictions } from './Prediction';

export type InteractionArtifact = {
  predictions: Predictions;
  interaction: Interaction | null;
};
