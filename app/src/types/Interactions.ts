import { DataPoint } from '../stores/types/Dataset';

import { Intent } from './Prediction';

type BaseInteraction = {
  i_type:
    | 'ViewSpec'
    | 'Root'
    | 'Selection'
    | 'Filter'
    | 'Label'
    | 'Categorize'
    | 'Aggregate'
    | 'ReplaceAggregate';
};

type RootInteraction = {
  i_type: 'Root';
};

// View Specifications
type BaseSpec = BaseInteraction & {
  i_type: 'ViewSpec';
  id: string;
  type: 'Scatterplot' | 'PCP';
  dimensions: string[];
};

export type ScatterplotSpec = BaseSpec & {
  type: 'Scatterplot';
  action: 'Add' | 'Remove';
};

export type PCPSpec = BaseSpec & {
  id: string;
  type: 'PCP';
  action: 'Create' | 'Add' | 'Remove';
};

export type ViewSpec = ScatterplotSpec | PCPSpec;

export function getDimensionsFromViewSpec(spec: ViewSpec): string[] {
  return spec.dimensions;
}

// Selections
type BaseSelection = BaseInteraction & {
  i_type: 'Selection';
  type: 'Point' | 'Range' | 'Algorithmic' | 'Category';
};

export type PointSelection = BaseSelection & {
  type: 'Point';
  action: 'Selection' | 'Deselection';
  ids: string[];
};

type Extents = { [key: string]: { min: number; max: number } };

type RangeSelection = BaseSelection & {
  type: 'Range';
  rangeId: string;
  view: string;
  action: 'Add' | 'Remove' | 'Update';
  extents: Extents;
};

type AlgorithmicSelection = BaseSelection & {
  type: 'Algorithmic';
  apply: Intent;
};

export type Selection = PointSelection | RangeSelection | AlgorithmicSelection;

export function getSelectedPoints(
  extents: Extents,
  data: DataPoint[],
  x_col: string,
  y_col: string,
): string[] {
  return data
    .filter((point) => !(point.id.startsWith('agg') && point.iid.startsWith('agg')))
    .filter((point) => {
      const [x, y] = [point[x_col] as number, point[y_col] as number];

      if (
        x >= extents[x_col].min &&
        x <= extents[x_col].max &&
        y >= extents[y_col].min &&
        y <= extents[y_col].max
      )
        return true;

      return false;
    })
    .map((d) => d.id);
}

export function extentToBrushExtent(extents: Extents, x: string, y: string) {
  const [x1, x2, y1, y2] = [extents[x].min, extents[x].max, extents[y].min, extents[y].max];

  return { x1, x2, y1, y2 };
}

// Filters
export type Filter = BaseInteraction & {
  i_type: 'Filter';
  action: 'In' | 'Out';
};

// Labels
export type Label = BaseInteraction & {
  i_type: 'Label';
  // action: 'Assign' | 'Unassign';
  as: string;
};

// Categorize
export type Categorize = BaseInteraction & {
  i_type: 'Categorize';
  // action: 'Assign' | 'Unassign';
  in: string;
  as: string;
};

export type AggregateBy = 'Mean' | 'Median' | 'Sum' | 'Min' | 'Max';

// Aggregate
export type Aggregate = {
  i_type: 'Aggregation';
  // action: 'Aggregate' | 'Unaggregate';
  id: string;
  name: string;
  drop: boolean;
  rules: { [columnName: string]: AggregateBy };
};

// Interactions Type
export type Interaction =
  | ViewSpec
  | Selection
  | Filter
  | Label
  | Categorize
  | Aggregate
  | RootInteraction;

export type Interactions = Interaction[];
