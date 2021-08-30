import Axios from 'axios';

import { BrushCollection } from '../components/Brushes/Rectangular Brush/Types/Brush';

import { COMPUTE } from './../index';
import { PCPSpec, ScatterplotSpec, ViewSpec } from './../types/Interactions';
import { StateRecord } from './ExploreStore';
import { DataPoint } from './types/Dataset';
import { ReapplyGraph } from './types/Provenance';

type BaseView = {
  id: string;
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

// # View State
export type ViewState = {
  views: { [k: string]: View };
  labels: { [k: string]: string[] };
  freeformSelections: string[];
  filteredPoints: string[];
  categoryAssignments: { [categoryName: string]: { [value: string]: string[] } };
  aggregates: {
    [id: string]: {
      name: string;
      values: string[];
      aggregate: DataPoint;
    };
  };
};

export const defaultViewState: ViewState = {
  views: {},
  labels: {},
  filteredPoints: [],
  categoryAssignments: {},
  freeformSelections: [],
  aggregates: {},
};

// Helper Functions

export function clearSelections(state: ViewState): ViewState {
  Object.entries(state.views).forEach(([id, view]) => {
    view.brushSelections = {};
    view.brushes = {};
    state.views[id] = view;
  });

  state.freeformSelections = [];

  return state;
}

export function getSelections(state: ViewState): string[] {
  const selections: string[] = [...state.freeformSelections];

  Object.values(state.views).forEach((view) => {
    Object.values(view.brushSelections).forEach((sels) => selections.push(...sels));
  });

  return [...new Set(selections)].sort();
}

export function getDimensions(state: ViewState): string[] {
  const dims: string[] = [];
  Object.values(state.views).forEach((d) => {
    if (d.type === 'Scatterplot') dims.push(...[d.x, d.y]);
    else dims.push(...d.dimensions);
  });

  return [...new Set(dims)];
}

export function getView(spec: ViewSpec): View {
  if (spec.type === 'Scatterplot') {
    return {
      id: spec.id,
      type: 'Scatterplot',
      x: spec.dimensions[0],
      y: spec.dimensions[1],
      spec,
      brushes: {},
      brushSelections: {},
    };
  }

  return {
    id: spec.id,
    type: 'PCP',
    spec,
    dimensions: spec.dimensions,
    brushes: {},
    brushSelections: {},
  };
}

export async function queryState(_data: DataPoint[], provenance: ReapplyGraph) {
  const { data } = await Axios.post<StateRecord>(`${COMPUTE}/state`, {
    data: _data,
    provenance,
  });

  return data;
}
