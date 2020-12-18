import { Brush } from '../components/Brush/Types/Brush';

import { DatasetColumn } from './Dataset';

export type ExtendedBrush = Brush & {
  points: number[];
};

export type ExtendedBrushCollection = { [key: string]: ExtendedBrush };

export type Plot = {
  id: string;
  x: DatasetColumn;
  y: DatasetColumn;
  brushes: ExtendedBrushCollection;
  selectedPoints: number[];
};

export type Plots = Plot[];
