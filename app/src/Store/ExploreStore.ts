/* eslint-disable @typescript-eslint/no-unused-vars */
import { NodeID } from '@visdesignlab/trrack';
import Axios, { AxiosResponse } from 'axios';
import { action, makeAutoObservable } from 'mobx';

import { BrushAffectType } from './../components/Brush/Types/Brush';
import { SERVER } from './../consts';
import { BrushType, ExtendedBrushCollection, MultiBrushBehaviour } from './IntentState';
import { RootStore } from './Store';
import { Dataset } from './Types/Dataset';
import { Plot, Plots } from './Types/Plot';
import { Prediction, Predictions } from './Types/Prediction';

type DatasetRecord = {
  [key: string]: {
    plots: Plots;
    selectedPrediction: Prediction;
    filterList: string[];
  };
};

type NodeRecords = { [key: string]: DatasetRecord };
export class ExploreStore {
  rootStore: RootStore;
  isLoadingData = false;
  isLoadingPredictions = false;
  hoveredPrediction: Prediction | null = null;
  records: NodeRecords = {};
  multiBrushBehaviour: MultiBrushBehaviour = 'Union';
  showCategories = false;
  brushType: BrushType = 'Rectangular';

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  // ##################################################################### //
  // ############################## Getters ############################## //
  // ##################################################################### //

  get currentNode() {
    return this.provenance.current.id;
  }

  get state() {
    return this.records[this.currentNode][this.currentDataset.key];
  }

  get currentDataset() {
    const dataset = this.rootStore.projectStore.loadedDataset;

    if (!dataset) throw new Error('Dataset not loaded');

    return dataset;
  }

  get currentDatasetKey() {
    return this.currentDataset.key;
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
    const { plots } = this.state;

    return Object.values(plots).length;
  }

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
  // ######################### Provenance Actions ######################## //
  // ##################################################################### //

  addPlot = (plot: Plot): void => {
    const { addPlotAction } = this.rootStore.actions;
    addPlotAction.setLabel('Add Plot');
    this.provenance.apply(addPlotAction(plot));
    this.addInteraction({ type: 'AddPlot', plot });
    this.rootStore.currentNodes.push(this.provenance.graph.current);
  };

  removePlot = (plot: Plot) => {
    const { removePlotAction } = this.rootStore.actions;

    removePlotAction.setLabel(`Remove plot: ${plot.x} - ${plot.y}`);
    this.provenance.apply(removePlotAction(plot));

    this.rootStore.currentNodes.push(this.provenance.graph.current);
  };

  filter = (removeIds: string[], filterType: FilterType) => {
    const { filterAction } = this.rootStore.actions;

    const currSelected = JSON.parse(JSON.stringify(this.selectedPoints));

    filterAction.setLabel(`Filter`);

    this.provenance.apply(filterAction(removeIds));

    this.rootStore.currentNodes.push(this.provenance.graph.current);

    this.addInteraction({ type: 'Filter', filterType, points: currSelected });
  };

  switchBrush = (brushType: BrushType) => {
    const { switchBrushTypeAction } = this.rootStore.actions;

    let label = 'None';

    switch (brushType) {
      case 'Rectangular':
        label = 'Rectangular Brush';
        break;
      case 'Freeform Large':
        label = 'Large Paint Brush';
        break;
      case 'Freeform Medium':
        label = 'Medium Paint Brush';
        break;
      case 'Freeform Small':
        label = 'Small Paint Brush';
        break;
      default:
        label = 'Disable Brush';
        break;
    }

    this.provenance.apply(switchBrushTypeAction.setLabel(label)(brushType));
    this.addPredictions();
  };

  setFreeformSelection = (plot: Plot, points: string[]) => {
    this.addPointSelection(plot, points, true);
  };

  addPointSelection = (plot: Plot, points: string[], isPaintBrush = false) => {
    if (points.length === 0) return;

    const { pointSelectionAction } = this.rootStore.actions;

    pointSelectionAction.setLabel(
      isPaintBrush ? `P. Brush: ${points.length}` : `Add Point Selection`,
    );
    this.provenance.apply(pointSelectionAction(plot, points));

    this.addInteraction({ type: 'PointSelection', selected: points, plot });
    this.addPredictions();

    this.rootStore.currentNodes.push(this.provenance.graph.current);
  };

  setBrushSelection = (
    plot: Plot,
    brushes: ExtendedBrushCollection,
    type: BrushAffectType,
    affectedId: string,
  ) => {
    const { addBrushAction, updateBrushAction, removeBrushAction } = this.rootStore.actions;

    switch (type) {
      case 'Add':
        addBrushAction.setLabel(`Added brush to: ${plot.x}-${plot.y}`);
        this.provenance.apply(addBrushAction(plot, brushes));
        this.addInteraction({ type: 'Brush', plot, action: 'Add', brush: affectedId });
        break;
      case 'Update':
        updateBrushAction.setLabel(`Updated brush in: ${plot.x}-${plot.y}`);
        this.provenance.apply(updateBrushAction(plot, brushes));
        this.addInteraction({ type: 'Brush', plot, action: 'Update', brush: affectedId });
        break;
      case 'Remove':
        removeBrushAction.setLabel(`Removed brush in: ${plot.x}-${plot.y}`);
        this.provenance.apply(removeBrushAction(plot, brushes));
        this.addInteraction({
          type: 'Brush',
          plot,
          action: 'Remove',
          brush: affectedId,
        });
        break;
      default:
        break;
    }
    this.addPredictions();
    //
  };

  setPredictionSelection = (prediction: Prediction) => {
    const { predictionSelectionAction } = this.rootStore.actions;

    predictionSelectionAction.setLabel(`${prediction.intent} Selection`);
    this.provenance.apply(predictionSelectionAction(prediction));
    this.addInteraction({ type: 'SelectPrediction', prediction });
    this.addPredictions();
  };

  // changeCategory = (category: string) => {
  //   const { changeCategoryAction } = this.rootStore.actions;

  //   changeCategoryAction.setLabel(`Category: ${category}`);
  //   this.provenance.apply(changeCategoryAction(category));
  //   this.addInteraction({ type: 'ChangeCategory', category });
  //   this.rootStore.currentNodes.push(this.provenance.graph.current);
  // };

  // toggleCategories = (show: boolean, categories: string[] = []) => {
  //   const { toggleCategoryAction } = this.rootStore.actions;

  //   if (!show) {
  //     toggleCategoryAction.setLabel('Hide Categories');
  //     this.provenance.apply(toggleCategoryAction(show, ''));
  //     this.addInteraction({ type: 'ToggleCategory', show });

  //     return;
  //   }

  //   if (categories.length === 0) throw new Error('No category columns');

  //   let category = categories[0];

  //   if (this.state.categoryColumn !== '') category = this.state.categoryColumn;

  //   toggleCategoryAction.setLabel('Show Categories');
  //   this.provenance.apply(toggleCategoryAction(show, category));
  //   this.addInteraction({ type: 'ToggleCategory', show });
  //   this.addInteraction({ type: 'ChangeCategory', category });
  //   this.rootStore.currentNodes.push(this.provenance.graph.current);
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

  addInteraction = (interaction: BaseInteraction | null) => {
    const id = this.provenance.current.id;

    if (!interaction) {
      this.provenance.addArtifact({ ...this.artifact, interaction });

      return;
    }

    this.provenance.addArtifact({ ...this.artifact, interaction: { id, ...interaction } });
  };

  addPredictions = () => {
    this.hoveredPrediction = null;
    const dimensions: string[] = [];

    if (this.selectedPoints.length === 0) return;

    this.isLoadingPredictions = true;

    Object.values(this.state.plots).forEach((plt) => {
      dimensions.push(...[plt.x, plt.y]);
    });

    Axios.post(`${SERVER}/${this.currentProject.key}/dataset/predict/${this.loadedDatasetKey}`, {
      selections: this.selectedPoints,
      dimensions,
    }).then(
      action((response: AxiosResponse<Predictions>) => {
        const { data = [] } = response;
        this.provenance.addArtifact({ ...this.artifact, predictions: data });
        this.isLoadingPredictions = false;
      }),
    );
  };

  goToNode = (id: NodeID): void => {
    this.provenance.goToNode(id);
  };
}
