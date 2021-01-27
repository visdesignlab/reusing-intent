import { Plot } from './Plot';

export type AddPlotInteraction = {
  type: 'AddPlot';
  plot: Plot;
};

export type Interaction = {};

export type Interactions = Interaction[];
