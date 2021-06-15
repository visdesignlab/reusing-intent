import { DatasetColumn } from './Dataset';

export type PlotID = string;

export type Plot = {
  id: PlotID;
  x: DatasetColumn;
  y: DatasetColumn;
};

export type Plots = { [key in PlotID]: Plot };
