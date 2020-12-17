import { Brush } from '../components/Brush/Brush';
import { InteractionHistory, Prediction } from '../contract';

import { DatasetColumn } from './Dataset';

export type MultiBrushBehaviour = 'Union' | 'Intersection';

export type ExtendedBrush = {
  points: number[];
} & Brush;

export type ExtendedBrushCollection = { [key: string]: ExtendedBrush };

export type BrushType =
  | 'Rectangular'
  | 'Freeform Small'
  | 'Freeform Medium'
  | 'Freeform Large'
  | 'None';

export const BrushSize: { [key: string]: number } = {
  'Freeform Small': 20,
  'Freeform Medium': 35,
  'Freeform Large': 50,
};

export type Plot = {
  id: string;
  x: DatasetColumn;
  y: DatasetColumn;
  brushes: ExtendedBrushCollection;
  selectedPoints: number[];
};

export function getDefaultPlot(): Plot {
  return {
    id: '',
    x: '',
    y: '',
    brushes: {},
    selectedPoints: [],
  };
}

export type Plots = Plot[];

export type IntentState = {
  dataset: string;
  showCategories: boolean;
  categoryColumn: string;
  multiBrushBehaviour: MultiBrushBehaviour;
  plots: Plots;
  //only store your own interaction
  interactionHistory: InteractionHistory;
  brushType: BrushType;

  //create interaction type for this
  lockedPrediction: Prediction | null;
};

export const defaultState: IntentState = {
  dataset: '',
  multiBrushBehaviour: 'Union',
  showCategories: true,
  categoryColumn: '',
  plots: [],
  interactionHistory: [],
  brushType: 'Freeform Medium',

  lockedPrediction: null,
};