import { NodeID } from '@visdesignlab/trrack';
import Axios, { AxiosResponse } from 'axios';
import { action, makeAutoObservable, reaction } from 'mobx';

import deepCopy from '../Utils/DeepCopy';

import { BrushAffectType, BrushCollection } from './../components/Brush/Types/Brush';
import { SERVER } from './../consts';
import { BrushType, ExtendedBrushCollection, MultiBrushBehaviour } from './IntentState';
import { RootStore } from './Store';
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

export class ExploreStore {
  rootStore: RootStore;
  isLoadingData = false;
  isLoadingPredictions = false;
  hoveredPrediction: Prediction | null = null;
  multiBrushBehaviour: MultiBrushBehaviour = 'Union';
  showCategories = false;
  brushType: BrushType = 'Rectangular';
  // key here is DatasetID
  stateRecord: { [key: string]: Record } = {};
  predictions: Predictions = [];
  currBrushed: string[] = [];

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);

    reaction(
      () => this.state,
      () => {
        this.addPredictions();
      },
    );

    reaction(
      () => Object.values(this.provenance.graph.nodes).length,
      () =>
        this.provenance.addArtifact({
          original_dataset: this.currentDatasetKey,
          status_record: {},
        }),
    );
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
    let dataset = this.rootStore.projectStore.comparisonDataset;

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
    this.rootStore.projectStore.addToCreationMap(this.provenance.graph.current);
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
    this.rootStore.projectStore.addToCreationMap(this.provenance.graph.current);
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
    // this.rootStore.currentNodes.push(this.provenance.graph.current);
    // this.rootStore.projectStore.addToCreationMap(this.provenance.graph.current);

    // this.addInteraction({ type: 'Filter', filterType, points: currSelected });
  };

  // switchBrush = (brushType: BrushType) => {
  //   const { switchBrushTypeAction } = this.rootStore.actions;

  //   let label = 'None';

  //   switch (brushType) {
  //     case 'Rectangular':
  //       label = 'Rectangular Brush';
  //       break;
  //     case 'Freeform Large':
  //       label = 'Large Paint Brush';
  //       break;
  //     case 'Freeform Medium':
  //       label = 'Medium Paint Brush';
  //       break;
  //     case 'Freeform Small':
  //       label = 'Small Paint Brush';
  //       break;
  //     default:
  //       label = 'Disable Brush';
  //       break;
  //   }

  //   this.provenance.apply(switchBrushTypeAction.setLabel(label)(brushType));
  //   this.addPredictions();
  //   this.rootStore.projectStore.addToCreationMap(this.provenance.graph.current);

  // };

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
    this.rootStore.projectStore.addToCreationMap(this.provenance.graph.current);
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
    this.rootStore.projectStore.addToCreationMap(this.provenance.graph.current);
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
    this.rootStore.projectStore.addToCreationMap(this.provenance.graph.current);
  };

  // changeCategory = (category: string) => {
  //   const { changeCategoryAction } = this.rootStore.actions;

  //   changeCategoryAction.setLabel(`Category: ${category}`);
  //   this.provenance.apply(changeCategoryAction(category));
  //   this.addInteraction({ type: 'ChangeCategory', category });
  //   this.rootStore.currentNodes.push(this.provenance.graph.current);
  //   this.rootStore.projectStore.addToCreationMap(this.provenance.graph.current);
  // };

  // toggleCategories = (show: boolean, categories: string[] = []) => {
  //   const { toggleCategoryAction } = this.rootStore.actions;

  //   this.addPredictions();
  //   if (this.state.categoryColumn !== '') category = this.state.categoryColumn;

  //   toggleCategoryAction.setLabel('Show Categories');
  //   this.provenance.apply(toggleCategoryAction(show, category));
  //   this.addInteraction({ type: 'ToggleCategory', show });
  //   this.addInteraction({ type: 'ChangeCategory', category });
  //   this.rootStore.currentNodes.push(this.provenance.graph.current);
  //   this.rootStore.projectStore.addToCreationMap(this.provenance.graph.current);
  // };

  // ##################################################################### //
  // ########################### Store Actions ########################### //
  // ##################################################################### //

  setHoveredPrediction = (prediction: Prediction | null) => {
    this.hoveredPrediction = prediction;
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
