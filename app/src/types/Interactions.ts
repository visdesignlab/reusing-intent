import { Prediction } from './Prediction';

// View Specifications
type BaseSpec = {
  i_type: 'ViewSpec';
  id: string;
};

export type ScatterplotSpec = BaseSpec & {
  x: string;
  y: string;
  type: 'Scatterplot';
};

export type PCPSpec = BaseSpec & {
  dimension: string;
  type: 'PCP';
};

export type ViewSpec = ScatterplotSpec | PCPSpec;

// Selections
export type PointSelection = {
  i_type: 'PointSelection';
  type: 'Selection' | 'Deselection';
  view: ViewSpec;
  ids: string[];
};

type Extent = {
  min: number;
  max: number;
};

type AddBrushSelection = {
  type: 'Add';
  view: ViewSpec;
  id: string;
  extents: { [key: string]: Extent };
};

type UpdateBrushSelection = {
  type: 'Update';
  view: ViewSpec;
  id: string;
  extents: { [key: string]: Extent };
};

type RemoveBrushSelection = {
  type: 'Remove';
  id: string;
  view: ViewSpec;
  extents: { [key: string]: Extent };
};

export type BrushAction = { i_type: 'BrushSelection' } & (
  | AddBrushSelection
  | RemoveBrushSelection
  | UpdateBrushSelection
);

type PredictionSelection = {
  i_type: 'PredictionSelection';
  apply: Prediction;
};

export type Selections = PointSelection | BrushAction | PredictionSelection;

// Filters
export type Filter = {
  i_type: 'Filter';
  in: boolean;
};

// Labels
export type Label = {
  i_type: 'Label';
  as: string;
  ids?: string[];
};

// Categorize
export type Categorize = {
  i_type: 'Categorize';
  in: string;
  as: string;
  ids?: string[];
};

// Aggregate
export type Aggregate = {
  i_type: 'Aggregate';
  by: 'Mean' | 'Median' | 'Sum' | 'Min' | 'Max';
};

// Replace Aggregate
export type ReplaceAggregate = {
  i_type: 'ReplaceAggregate';
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
