import { Brush } from '../../components/Brush/Types/Brush';

import { Plot, PlotID } from './Plot';
import { Prediction } from './Prediction';

export type AddPlotInteraction = {
  type: 'AddPlot';
  plot: Plot;
};

export type RemovePlotInteraction = {
  type: 'RemovePlot';
  plot: PlotID;
};

type BasePointSelection = {
  type: 'PointSelection';
  plot: PlotID;
  selected: string[];
};

export type PointSelectionInteraction = BasePointSelection & {
  action: 'Add';
};

export type PointDeselectionInteraction = BasePointSelection & {
  action: 'Remove';
};

type BaseBrushInteraction = {
  type: 'Brush';
  plot: PlotID;
  brush: Brush | string;
};

export type AddBrushInteraction = BaseBrushInteraction & {
  type: 'Brush';
  action: 'Add';
};

export type UpdateBrushInteraction = BaseBrushInteraction & {
  type: 'Brush';
  action: 'Update';
};

export type RemoveBrushInteraction = BaseBrushInteraction & {
  type: 'Brush';
  brush: string;
  action: 'Remove';
};

export type SelectPredictionInteraction = {
  type: 'SelectPrediction';
  prediction: Prediction;
};

type BaseFilterInteraction = {
  type: 'Filter';
};

export type FilterInInteraction = BaseFilterInteraction & {
  filterType: 'In';
};

export type FilterOutInteraction = BaseFilterInteraction & {
  filterType: 'Out';
};

type RootInteraction = {
  type: 'Root';
};

export type Interaction =
  | AddPlotInteraction
  | RemovePlotInteraction
  | PointSelectionInteraction
  | PointDeselectionInteraction
  | AddBrushInteraction
  | RemoveBrushInteraction
  | UpdateBrushInteraction
  | PointSelectionInteraction
  | SelectPredictionInteraction
  | FilterInInteraction
  | FilterOutInteraction
  | RootInteraction;

export type State = {
  interaction: Interaction;
};
