import { Prediction } from './Prediction';

// View Specifications
type BaseSpec = {
  id: string;
};

type ScatterplotSpec = BaseSpec & {
  x: string;
  y: string;
  type: 'Scatterplot';
};

type PCPSpec = BaseSpec & {
  dimensions: string[];
  type: 'PCP';
};

export type ViewSpec = ScatterplotSpec | PCPSpec;

// Selections
type PointSelection = {
  ids: string[];
};

type Extent = {
  min: number;
  max: number;
};

type AddBrushSelection = {
  view: ViewSpec;
  id: string;
  extents: { [key: string]: Extent };
};

type UpdateBrushSelection = {
  id: string;
  extents: { [key: string]: Extent };
};

type RemoveBrushSelection = {
  id: string;
  extents: { [key: string]: Extent };
};

type BrushActions = AddBrushSelection | RemoveBrushSelection | UpdateBrushSelection;

type PredictionSelection = {
  apply: Prediction;
};

export type Selections = PointSelection | BrushActions | PredictionSelection;

// Filters
export type Filter = {
  in: boolean;
};

// Labels
export type Label = {
  as: string;
  ids?: string[];
};

// Categorize
export type Categorize = {
  in: string;
  as: string;
  ids?: string[];
};

// Aggregate
export type Aggregate = {
  by: 'Mean' | 'Median' | 'Sum' | 'Min' | 'Max';
};

// Replace Aggregate
export type ReplaceAggregate = {
  drop: boolean;
};

// Interactions Type
export type Interaction =
  | ViewSpec
  | Selections
  | Filter
  | Label
  | Categorize
  | Aggregate
  | ReplaceAggregate;

export type Interactions = Interaction[];
