import { DataPoint } from '../stores/types/Dataset';

import { Intent } from './Prediction';

type BaseInteraction = {
  i_type:
    | 'ViewSpec'
    | 'Selection'
    | 'Filter'
    | 'Label'
    | 'Categorize'
    | 'Aggregate'
    | 'ReplaceAggregate';
};

// View Specifications
type BaseSpec = BaseInteraction & {
  i_type: 'ViewSpec';
  id: string;
  type: 'Scatterplot' | 'PCP';
};

export type ScatterplotSpec = BaseSpec & {
  type: 'Scatterplot';
  action: 'Add' | 'Remove';
  x: string;
  y: string;
};

export type PCPSpec = BaseSpec & {
  dimensions: string[];
  id: string;
  type: 'PCP';
  action: 'Create' | 'Add' | 'Remove';
};

export type ViewSpec = ScatterplotSpec | PCPSpec;

export function getDimensionsFromViewSpec(spec: ViewSpec): string[] {
  if (spec.type === 'Scatterplot') return [spec.x, spec.y];

  return spec.dimensions;
}

// Selections
type BaseSelection = BaseInteraction & {
  i_type: 'Selection';
  type: 'Point' | 'Brush' | 'Intent' | 'Category';
  spec: ViewSpec;
  dimensions: string[];
};

export type PointSelection = BaseSelection & {
  type: 'Point';
  action: 'Selection' | 'Deselection';
  ids: string[];
};

type Extents = { [key: string]: [number, number] };

type BrushSelection = BaseSelection & {
  type: 'Brush';
  brushId: string;
  action: 'Add' | 'Remove' | 'Update';
  extents: Extents;
};

type IntentSelection = BaseSelection & {
  type: 'Prediction';
  apply: Intent;
};

export type Selection = PointSelection | BrushSelection | IntentSelection;

export function getSelectedPoints(
  extents: Extents,
  data: DataPoint[],
  x_col: string,
  y_col: string,
): string[] {
  return data
    .filter((point) => !(point.id.startsWith('agg') && point.iid.startsWith('agg')))
    .filter((point) => {
      console.log(point.id);
      const [x, y] = [point[x_col] as number, point[y_col] as number];

      if (
        x >= extents[x_col][0] &&
        x <= extents[x_col][1] &&
        y >= extents[y_col][0] &&
        y <= extents[y_col][1]
      )
        return true;

      return false;
    })
    .map((d) => d.id);
}

export function extentToBrushExtent(extents: Extents, x: string, y: string) {
  const [x1, x2, y1, y2] = [extents[x][0], extents[x][1], extents[y][0], extents[y][1]];

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
  ids?: string[];
};

// Categorize
export type Categorize = BaseInteraction & {
  i_type: 'Categorize';
  // action: 'Assign' | 'Unassign';
  in: string;
  as: string;
  ids?: string[];
};

export type AggregateBy = 'Mean' | 'Median' | 'Sum' | 'Min' | 'Max';

// Aggregate
export type Aggregate = {
  i_type: 'Aggregation';
  // action: 'Aggregate' | 'Unaggregate';
  id: string;
  name: string;
  aggregate_map: { [columnName: string]: AggregateBy };
};

// Replace Aggregate
export type ReplaceAggregate = {
  i_type: 'ReplaceAggregate';
  id: string;
  drop: boolean;
};

// Interactions Type
export type Interaction =
  | ViewSpec
  | Selection
  | Filter
  | Label
  | Categorize
  | Aggregate
  | ReplaceAggregate;

export type Interactions = Interaction[];
