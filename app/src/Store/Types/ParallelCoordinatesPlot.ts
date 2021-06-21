import { DatasetColumn } from './Dataset';

export type PCPlotID = string;

export type PCPlot = {
  type: "pcp"
  id: PCPlotID;
  dimensions: DatasetColumn[]
};

export type PCPlots = { [key in PCPlotID]: PCPlot };
