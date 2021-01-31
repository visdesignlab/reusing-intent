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

type BaseBrushInteraction = {
  type: 'Brush';
  plot: Plot;
  brush: string;
};

type AddBrushInteraction = BaseBrushInteraction & {
  type: 'Brush';
  action: 'Add';
};

type UpdateBrushInteraction = BaseBrushInteraction & {
  type: 'Brush';
  action: 'Update';
};

type RemoveBrushInteraction = BaseBrushInteraction & {
  type: 'Brush';
  action: 'Remove';
};

type BrushInteraction = AddBrushInteraction | UpdateBrushInteraction | RemoveBrushInteraction;

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
  | ChangeCategoryInteraction
  | BrushInteraction;

export type Interactions = Interaction[];
