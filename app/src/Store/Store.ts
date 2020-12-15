import { Provenance } from '@visdesignlab/trrack';
import Axios, { AxiosResponse } from 'axios';
import { action, makeAutoObservable, observable } from 'mobx';
import { createContext } from 'react';

import { getPlotId } from '../Utils/IDGens';

import { Dataset, getColumns } from './Dataset';
import { Plot, Plots } from './Plot';

type State = {
  dataset: string;
};

class Store {
  datasets: string[] = [];
  dataset: string | null = null;
  data: Dataset | null = null;
  provenance: Provenance<State> | null = null;
  plots: Plots = [];

  constructor() {
    makeAutoObservable(this, {
      dataset: observable,
      provenance: observable,
      data: observable,
      plots: observable,
      setDataset: action,
      setDatasets: action,
      addPlot: action,
      reset: action,
    });
  }

  reset() {
    this.plots = [];
    this.data = null;
    this.dataset = null;
    this.provenance = null;
  }

  setDatasets = (datasets: string[]) => {
    this.datasets = datasets;

    if (this.datasets.length > 0 && this.dataset !== this.datasets[0]) {
      this.setDataset(this.datasets[0]);
    }
  };

  setDataset = async (datasetId: string) => {
    Axios.get(`http://127.0.0.1:5000/dataset/${datasetId}`).then(
      action((res: AxiosResponse<Dataset>) => {
        this.reset();
        this.dataset = datasetId;

        this.data = res.data;
        const columns = getColumns(this.data.columns);
        const plot1: Plot = {
          id: getPlotId(),
          x: columns[0],
          y: columns[1],
          brushes: {},
          selectedPoints: [],
        };
        this.addPlot(plot1);

        // const plot2: Plot = {
        //   id: getPlotId(),
        //   x: columns[0],
        //   y: columns[1],
        //   brushes: {},
        //   selectedPoints: [],
        // };
        // this.addPlot(plot2);
      }),
    );
  };

  addPlot = (plot: Plot) => {
    this.plots.push(plot);
  };
}

const IntentStore = createContext(new Store());
export default IntentStore;
