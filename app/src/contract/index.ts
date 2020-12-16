export enum VisualizationType {
  Grid = 'Grid',
  Scatterplot = 'Scatterplot',
  ScatterplotMatrix = 'ScatterplotMatrix',
  ParallelCoordinatePlot = 'ParallelCoordinatePlot',
  None = 'None',
}

type Selection = {
  plot: Plot;
  //shouldnt need this
  dimensions?: Array<string>;
  dataIds: Array<number>;
}

export type PointSelection = {
  kind: 'selection';
} & Selection

export type PointDeselection = {
  kind: 'deselection';
} & Selection

export type RectangularSelection = {
  brushId: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
} & Selection

//Dont need this
export type ChangeAxis = {
  dimensions: Array<string>;
}

export type ClearAllSelections = {
  kind: 'clearall';
} & Selection

//Use multibrushbehaviour type
export enum MultiBrushBehavior {
  INTERSECTION = 'INTERSECTION',
  UNION = 'UNION',
}

//dont need this
export type Plot = {
  id: string;
  x: string;
  y: string;
  color: string;
}

export type PredictionRequest = {
  multiBrushBehavior: MultiBrushBehavior;
  interactionHistory: InteractionHistory;
}

type PlotsInteraction = {
  plot: Plot;
}

export type AddPlotInteraction = {
  kind: 'ADD';
} & PlotsInteraction

export type RemovePlotInteraction = {
  kind: 'REMOVE';
} & PlotsInteraction

export type UpdatePlotInteraction = {
  kind: 'UPDATE';
} & PlotsInteraction

export type InteractionType =
  | ChangeAxis
  | ClearAllSelections
  | PointSelection
  | PointDeselection
  | RectangularSelection
  | AddPlotInteraction
  | RemovePlotInteraction
  | UpdatePlotInteraction;

export type Interaction = {
  visualizationType: VisualizationType;
  interactionType: InteractionType;
}

export type InteractionHistory = Array<Interaction>;

//change this to the prediction from intent_contract
export type Prediction = {
  rank: number;
  rankAc: number;
  intent: string;
  dataIds?: Array<number>;
  suggestion?: Array<Prediction>;
}