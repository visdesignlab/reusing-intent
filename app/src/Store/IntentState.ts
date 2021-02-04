import { Brush } from '../components/Brush/Types/Brush';

import { BrushSize } from './../components/Freeform/FreeFormBrush';
import { Plot, Plots } from './Types/Plot';
import { Prediction } from './Types/Prediction';

export type MultiBrushBehaviour = 'Union' | 'Intersection';

export type ExtendedBrush = {
  points: string[];
} & Brush;

export type ExtendedBrushCollection = { [key: string]: ExtendedBrush };

export type FreeFormBrushType = 'Freeform Small' | 'Freeform Medium' | 'Freeform Large';

export type BrushType = FreeFormBrushType | 'Rectangular' | 'None';

export const BrushSizeMap: { [key in FreeFormBrushType]: BrushSize } = {
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
  datasetKey: string;
  showCategories: boolean;
  categoryColumn: string;
  multiBrushBehaviour: MultiBrushBehaviour;
  plots: Plots;
  brushType: BrushType;
  selectedPrediction: Prediction | null;
};

export const defaultState: IntentState = {
  datasetKey: '',
  multiBrushBehaviour: 'Union',
  showCategories: false,
  categoryColumn: '',
  plots: {},
  brushType: 'Freeform Medium',
  selectedPrediction: null,
};
