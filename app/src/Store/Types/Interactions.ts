import { NodeID } from '@visdesignlab/trrack';

import { Plot } from './Plot';
import { Prediction } from './Prediction';

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

type SelectPredictionInteraction = {
  type: 'SelectPrediction';
  prediction: Prediction;
};

type FilterInteraction = {
  type: 'Filter';
  filterType: FilterType;
  points: string[];
};

export type FilterType = "In" | "Out";

export type BaseInteraction =
  | AddPlotInteraction
  | PointSelectionInteraction
  | ToggleCategoryInteraction
  | ChangeCategoryInteraction
  | BrushInteraction
  | SelectPredictionInteraction
  | FilterInteraction;

export type Interaction = BaseInteraction & {
  id: NodeID;
};

export type Interactions = Interaction[];
