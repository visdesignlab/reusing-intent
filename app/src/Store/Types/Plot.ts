import { DatasetColumn } from './Dataset';
import { PCPlot, PCPlotID } from './ParallelCoordinatesPlot';

export type SPlotID = string;

export type SPlot = {
  type: "scatter"
  id: SPlotID;
  x: DatasetColumn;
  y: DatasetColumn;
};

export type SPlots = { [key in SPlotID]: SPlot };

export type Plot = SPlot | PCPlot

export type Plots = { [key in SPlotID | PCPlotID]: Plot };

