import { Plot } from './Plot';

type AddPlotInteraction = {
  type: 'AddPlot';
  plot: Plot;
};

type PointSelectionInteraction = {
  type: 'PointSelection';
  plot: Plot;
  selected: string[];
};

type ToggleCategoryInteraction = {
  type: 'ToggleCategory';
  show: boolean;
};

type ChangeCategoryInteraction = {
  type: 'ChangeCategory';
  category: string;
};

export type Interaction =
  | AddPlotInteraction
  | PointSelectionInteraction
  | ToggleCategoryInteraction
  | ChangeCategoryInteraction;

export type Interactions = Interaction[];
