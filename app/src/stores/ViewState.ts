import { BrushCollection } from '../components/Brushes/Rectangular Brush/Types/Brush';

import { PCPSpec, ScatterplotSpec, ViewSpec } from './../types/Interactions';

type BaseView = {
  id: string;
  freeformSelections: string[];
  brushes: BrushCollection;
  brushSelections: { [key: string]: string[] };
  spec: ViewSpec;
};

export type ScatterplotView = BaseView & {
  type: 'Scatterplot';
  x: string;
  y: string;
  spec: ScatterplotSpec;
};

export type PCPView = BaseView & {
  type: 'PCP';
  dimensions: string[];
  spec: PCPSpec;
};

export type View = ScatterplotView | PCPView;

export type ViewState = {
  views: { [k: string]: View };
  labels: { [k: string]: string[] };
  filteredPoints: string[];
  categoryAssignments: { [categoryName: string]: { [value: string]: string[] } };
  aggregates: {
    [id: string]: {
      replace: boolean;
      values: { [col_name: string]: number };
    };
  };
};

export function clearSelections(state: ViewState): ViewState {
  Object.entries(state.views).forEach(([id, view]) => {
    view.brushSelections = {};
    view.brushes = {};
    view.freeformSelections = [];
    state.views[id] = view;
  });

  return state;
}

export function getSelections(state: ViewState): string[] {
  const selections: string[] = [];

  Object.values(state.views).forEach((view) => {
    selections.push(...view.freeformSelections);
    Object.values(view.brushSelections).forEach((sels) => selections.push(...sels));
  });

  return [...new Set(selections)];
}

export const defaultViewState: ViewState = {
  views: {},
  labels: {},
  filteredPoints: [],
  categoryAssignments: {},
  aggregates: {},
};
