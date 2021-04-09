import { isChildNode, NodeID } from '@visdesignlab/trrack';
import Axios, { AxiosResponse } from 'axios';
import { action, makeAutoObservable, reaction } from 'mobx';

import deepCopy from '../Utils/DeepCopy';
import { getWorkflowID } from '../Utils/IDGens';

import { BrushAffectType, BrushCollection } from './../components/Brush/Types/Brush';
import { SERVER } from './../consts';
import { BrushType, ExtendedBrushCollection, MultiBrushBehaviour } from './IntentState';
import { RootStore } from './Store';
import { Status } from './Types/Artifacts';
import { Dataset } from './Types/Dataset';
import { Plot, Plots } from './Types/Plot';
import { Prediction, Predictions } from './Types/Prediction';

function getDefaultRecord(): Record {
  return {
    plots: {},
    brushes: {},
    brushSelections: {},
    pointSelection: {},
    prediction: null,
    filter: null,
  };
}

type Filter = {
  type: 'In' | 'Out';
  points: string[];
};

type Record = {
  plots: Plots;
  brushes: { [key: string]: BrushCollection };
  brushSelections: { [key: string]: string[] };
  pointSelection: { [key: string]: string[] };
  prediction: Prediction | null;
  filter: Filter | null;
};

export type WorkflowType = {
  id: string;
  project: string;
  name: string;
  graph: NodeID[];
};

type Workflows = { [key: string]: WorkflowType };

let disposers: any[] = [];

export class ExploreStore {
  rootStore: RootStore;
  isLoadingData = false;
  isLoadingPredictions = false;
  hoveredPrediction: Prediction | null = null;
  multiBrushBehaviour: MultiBrushBehaviour = 'Union';
  showCategories = false;
  brushType: BrushType = 'Freeform Medium';
  stateRecord: { [key: string]: Record } = {};
  isComparison = false;
  predictions: Predictions = [];
  currBrushed: string[] = [];
  workflows: Workflows = {};
  currentWorkflow: string | null = null;
  workflowSyncStatus: { [key: string]: string } = {};
  isImporting = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    if (disposers.length > 0) {
      disposers.forEach((dis) => dis());
      disposers = [];
    }

    const ds1 = reaction(
      () => this.state,
      () => {
        this.addPredictions();
      },
    );

    const ds2 = reaction(
      () => Object.values(this.provenance.graph.nodes).length,
      (curr, prev) => {
        if (this.isImporting) return;

        if (prev === 1 && curr !== 2) return;

        const rec: { [key: string]: Status } = {};

        this.currentProject.datasets.forEach((dataset) => {
          rec[dataset.key] = this.currentDatasetKey === dataset.key ? 'Accepted' : 'Unknown';
        });

        this.provenance.addArtifact({
          original_dataset: this.currentDatasetKey,
          status_record: rec,
        });
      },
    );

    disposers = [ds1, ds2];
  }

  // ##################################################################### //
  // ############################## Getters ############################## //
  // ##################################################################### //

  get state() {
    if (!this.currentNode || !(this.currentNode in this.stateRecord)) return getDefaultRecord();

    return deepCopy(this.stateRecord[this.currentNode]);
  }

  get currentNode() {
    return this.provenance.current.id;
  }

  get currentDatasetKey() {
    return this.rootStore.projectStore.currentDatasetKey;
  }

  get currentDataset() {
    const dataset = this.rootStore.projectStore.loadedDataset;

    if (!dataset) throw new Error('Dataset not loaded');

    return dataset;
  }

  get showSkylineLegend() {
    return this.hoveredPrediction && this.hoveredPrediction.intent === 'Skyline';
  }

  get showMatchesLegend() {
    return this.hoveredPrediction ? true : false;
  }

  get provenance() {
    return this.rootStore.provenance;
  }

  get currentProject() {
    const curr = this.rootStore.projectStore.currentProject;

    if (!curr) throw new Error();

    return curr;
  }

  get n_plots() {
    return this.plots.length;
  }

  get plots() {
    return Object.values(this.state.plots);
  }

  get selectedPoints() {
    const selections: string[] = [];

    const { brushSelections } = this.state;

    Object.values(brushSelections).forEach((sel) => {
      selections.push(...sel);
    });

    Object.values(this.state.pointSelection).forEach((sel) => selections.push(...sel));

    if (this.state.prediction) selections.push(...this.state.prediction.memberIds);

    return deepCopy(Array.from(new Set(selections)));
  }

  get filteredPoints() {
    const selections: string[] = [];

    const { filter } = this.state;

    if (!filter) return [];

    Object.values(filter.points).forEach((p) => {
      selections.push(p);
    });

    return deepCopy(Array.from(new Set(selections)));
  }

  get workingValues() {
    const { filter } = this.state;

    if (!filter) return this.loadedDataset.values;

    const { type, points } = filter;

    if (type === 'In') {
      return this.loadedDataset.values.filter((d) => points.includes(d.id));
    }

    return this.loadedDataset.values.filter((d) => !points.includes(d.id));
  }

  get artifact() {
    const art = this.provenance.getLatestArtifact();

    if (!art)
      return {
        original_dataset: null,
        status_record: {},
      };

    return art.artifact;
  }

  // get predictions() {
  //   return this.artifact.predictions || [];
  // }

  get loadedDataset() {
    let dataset = this.rootStore.projectStore.loadedDataset;

    if (!dataset) {
      const dt_str = window.localStorage.getItem('dataset');

      if (!dt_str) throw new Error('Dataset not loaded');

      dataset = JSON.parse(dt_str) as Dataset;

      return dataset;
    }

    window.localStorage.setItem('dataset', JSON.stringify(dataset));

    return dataset;
  }

  get compDataset() {
    let dataset = this.rootStore.projectStore.currentComparisonDatasets[1];

    if (!dataset) {
      const dt_str = window.localStorage.getItem('dataset');

      if (!dt_str) throw new Error('Dataset not loaded');

      dataset = JSON.parse(dt_str) as Dataset;

      return dataset;
    }

    window.localStorage.setItem('dataset', JSON.stringify(dataset));

    return dataset;
  }

  get origCompDataset() {
    let dataset = this.rootStore.projectStore.currentComparisonDatasets[0];

    if (!dataset) {
      const dt_str = window.localStorage.getItem('dataset');

      if (!dt_str) throw new Error('Dataset not loaded');

      dataset = JSON.parse(dt_str) as Dataset;

      return dataset;
    }

    window.localStorage.setItem('dataset', JSON.stringify(dataset));

    return dataset;
  }

  // ##################################################################### //
  // ########################### Store Helpers ########################### //
  // ##################################################################### //

  updateBrushed = (newSelected: string[]) => {
    this.currBrushed = newSelected;
  };

  addWorkflow = (workflowName?: string) => {
    const counterInit = Object.values(this.workflows).filter((d) =>
      d.name.startsWith('Workflow #'),
    );

    let counter = 1;

    if (counterInit.length > 0) {
      const c = counterInit[counterInit.length - 1].name.split('#');
      counter = parseInt(c[c.length - 1]) + 1;
    }

    const workflow: WorkflowType = {
      id: getWorkflowID(),
      project: this.currentProject.key,
      name: workflowName ? workflowName : `Workflow #${counter}`,
      graph: [],
    };

    this.workflows[workflow.id] = workflow;
    this.currentWorkflow = workflow.id;
  };

  renameWorkflow = (id: string, name: string) => {
    this.workflows[id].name = name;
  };

  removeWorkflow = (id: string) => {
    delete this.workflows[id];

    if (this.currentWorkflow === id && Object.values(this.workflows).length > 0) {
      const ws = Object.values(this.workflows);
      this.currentWorkflow = ws[ws.length - 1].id;
    } else if (!this.workflows[id]) {
      this.currentWorkflow = null;
    }
  };

  setCurrentWorkflow = (id: string) => {
    this.currentWorkflow = id;
  };

  addToWorkflow = (id: string) => {
    if (!this.currentWorkflow) return;

    if (!this.workflows[this.currentWorkflow]) return;

    const { graph } = this.workflows[this.currentWorkflow];

    if (graph.includes(id)) return;

    let current = this.provenance.graph.nodes[id];

    while (current.label !== 'Root') {
      if (!isChildNode(current)) break;

      if (!graph.includes(current.id)) graph.push(current.id);

      current = this.provenance.graph.nodes[current.parent];
    }

    graph.sort(
      (a, b) =>
        (this.provenance.graph.nodes[a].metadata.createdOn || -1) -
        (this.provenance.graph.nodes[b].metadata.createdOn || -1),
    );

    this.workflows[this.currentWorkflow].graph = [...graph];
  };

  removeFromWorkflow = (id: string) => {
    if (!this.currentWorkflow) return;
    this.workflows[this.currentWorkflow].graph = this.workflows[this.currentWorkflow].graph.filter(
      (d) => d !== id,
    );
  };

  setSyncStatus = (key: string, val: string) => {
    this.workflowSyncStatus[key] = val;
  };

  // ##################################################################### //
  // ######################### Provenance Actions ######################## //
  // ##################################################################### //

  addPlot = (plot: Plot): void => {
    if (!this.currentDatasetKey) return;
    const { addPlotAction } = this.rootStore.actions;
    addPlotAction.setLabel('Add Plot');
    const { state } = this;

    this.provenance.apply(addPlotAction(plot));

    state.plots[plot.id] = plot;

    this.stateRecord[this.currentNode] = state;

    this.rootStore.currentNodes.push(this.provenance.graph.current);
  };

  removePlot = (plot: Plot) => {
    const { removePlotAction } = this.rootStore.actions;

    removePlotAction.setLabel(`Remove plot: ${plot.x} - ${plot.y}`);

    const { state } = this;
    this.provenance.apply(removePlotAction(plot));
    delete state.plots[plot.id];

    if (plot.id in state.brushes) delete state.brushes[plot.id];

    if (plot.id in state.pointSelection) delete state.pointSelection[plot.id];

    this.stateRecord[this.currentNode] = state;

    this.rootStore.currentNodes.push(this.provenance.graph.current);
  };

  filter = (filterType: 'In' | 'Out') => {
    const { filterAction } = this.rootStore.actions;

    filterAction.setLabel(`Filter: ${filterType}`);
    const { state } = this;
    const filter: Filter = { type: filterType, points: this.selectedPoints };

    this.provenance.apply(filterAction(filterType));

    state.brushes = {};
    state.brushSelections = {};
    state.pointSelection = {};
    state.prediction = null;
    state.filter = filter;

    this.stateRecord[this.currentNode] = state;

    this.rootStore.currentNodes.push(this.provenance.graph.current);
  };

  switchBrush = (brushType: BrushType) => {
    this.brushType = brushType;
  };

  setFreeformSelection = (plot: Plot, points: string[]) => {
    this.addPointSelection(plot, points, true);
  };

  addPointSelection = (plot: Plot, points: string[], isPaintBrush = false) => {
    if (points.length === 0) return;

    const { state } = this;

    const { pointSelectionAction } = this.rootStore.actions;

    pointSelectionAction.setLabel(
      isPaintBrush ? `P. Brush: ${points.length}` : `Add Point Selection`,
    );
    this.provenance.apply(pointSelectionAction(plot, points));

    if (!(plot.id in state.pointSelection)) {
      state.pointSelection[plot.id] = [];
    }
    state.pointSelection[plot.id].push(...points);

    this.stateRecord[this.currentNode] = state;

    this.rootStore.currentNodes.push(this.provenance.graph.current);

    this.addPredictions();
  };

  setBrushSelection = (
    plot: Plot,
    brushes: ExtendedBrushCollection,
    type: BrushAffectType,
    affectedId: string,
  ) => {
    const { addBrushAction, updateBrushAction, removeBrushAction } = this.rootStore.actions;
    const { state } = this;

    switch (type) {
      case 'Add':
        addBrushAction.setLabel(`Added brush to: ${plot.x}-${plot.y}`);
        this.provenance.apply(addBrushAction(plot, brushes[affectedId]));
        state.brushSelections[affectedId] = brushes[affectedId].points;
        state.brushes[plot.id] = brushes;
        break;
      case 'Update':
        updateBrushAction.setLabel(`Updated brush in: ${plot.x}-${plot.y}`);
        this.provenance.apply(updateBrushAction(plot, brushes[affectedId]));
        state.brushSelections[affectedId] = brushes[affectedId].points;
        state.brushes[plot.id] = brushes;
        break;
      case 'Remove':
        removeBrushAction.setLabel(`Removed brush in: ${plot.x}-${plot.y}`);
        this.provenance.apply(removeBrushAction(plot, affectedId));
        delete state.brushSelections[affectedId];
        delete brushes[affectedId];
        state.brushes[plot.id] = brushes;
        break;
      default:
        break;
    }

    this.stateRecord[this.currentNode] = state;
    this.addPredictions();
    //
  };

  setPredictionSelection = (prediction: Prediction) => {
    const { predictionSelectionAction } = this.rootStore.actions;
    const { state } = this;
    prediction.original_id = this.currentDatasetKey || '';
    predictionSelectionAction.setLabel(`${prediction.intent} Selection`);
    this.provenance.apply(predictionSelectionAction(prediction));
    state.brushes = {};
    state.brushSelections = {};
    state.pointSelection = {};
    state.prediction = prediction;

    this.stateRecord[this.currentNode] = state;
    this.addPredictions();
  };

  // ##################################################################### //
  // ########################### Store Actions ########################### //
  // ##################################################################### //

  setHoveredPrediction = (prediction: Prediction | null) => {
    this.hoveredPrediction = prediction;
  };

  setComparison = (comp: boolean) => {
    this.isComparison = comp;
  };

  // ##################################################################### //
  // ######################### Provenance Helpers ######################## //
  // ##################################################################### //

  addPredictions = () => {
    this.hoveredPrediction = null;
    const dimensions: string[] = [];

    if (this.selectedPoints.length === 0) return;

    this.isLoadingPredictions = true;

    Object.values(this.state.plots).forEach((plt) => {
      dimensions.push(...[plt.x, plt.y]);
    });

    Axios.post(`${SERVER}/${this.currentProject.key}/dataset/predict/${this.currentDatasetKey}`, {
      selections: this.selectedPoints,
      dimensions,
    }).then(
      action((response: AxiosResponse<Predictions>) => {
        const { data = [] } = response;
        // this.provenance.addArtifact({ ...this.artifact, predictions: data });
        this.predictions = data;
        this.isLoadingPredictions = false;
      }),
    );
  };

  goToNode = (id: NodeID): void => {
    this.provenance.goToNode(id);
  };
}
