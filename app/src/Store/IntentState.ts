import { Brush } from '../components/Brush/Types/Brush';

import { Interactions } from './Types/Interactions';
import { Plot, Plots } from './Types/Plot';
import { Prediction } from './Types/Prediction';

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

export function getDefaultPlot(): Plot {
  return {
    id: '',
    x: '',
    y: '',
    brushes: {},
    selectedPoints: [],
  };
}

export type IntentState = {
  dataset: string;
  showCategories: boolean;
  categoryColumn: string;
  multiBrushBehaviour: MultiBrushBehaviour;
  plots: Plots;
  //only store your own interaction
  interactions: Interactions;
  brushType: BrushType;

  //create interaction type for this
  selectedPrediction: Prediction | null;
};

export const defaultState: IntentState = {
  dataset: '',
  multiBrushBehaviour: 'Union',
  showCategories: true,
  categoryColumn: '',
  plots: [],
  interactions: [],
  brushType: 'Freeform Medium',
  selectedPrediction: null,
};
