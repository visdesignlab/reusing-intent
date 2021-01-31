import { ExtendedBrushCollection } from './../IntentState';
import { DatasetColumn } from './Dataset';

export type PlotID = string;

export type Plot = {
  id: PlotID;
  x: DatasetColumn;
  y: DatasetColumn;
  brushes: ExtendedBrushCollection;
  selectedPoints: string[];
};

export type Plots = { [key in PlotID]: Plot };
