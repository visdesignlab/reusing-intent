/* eslint-disable @typescript-eslint/no-unused-vars */
import { isChildNode, NodeID } from '@visdesignlab/trrack';
import Axios, { AxiosResponse } from 'axios';
import { action, makeAutoObservable, toJS } from 'mobx';

import { isEmptyOrNull } from '../Utils/isEmpty';

import { BrushAffectType } from './../components/Brush/Types/Brush';
import { ExtendedBrushCollection } from './IntentState';
import { RootStore } from './Store';
import { Dataset } from './Types/Dataset';
import { InteractionArtifact } from './Types/InteractionArtifact';
import { BaseInteraction, Interactions } from './Types/Interactions';
import { Plot } from './Types/Plot';
import { Prediction, Predictions } from './Types/Prediction';

export class ExploreStore {
  rootStore: RootStore;
  showMatchesLegend = false;
  isLoadingData = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
  }

  // ##################################################################### //
  // ############################## Getters ############################## //
  // ##################################################################### //

  get state() {
    return this.rootStore.state;
  }

  get provenance() {
    return this.rootStore.provenance;
  }
  get currentProject() {
    const curr = this.rootStore.projectStore.currentProject;

    if (!curr) throw new Error();

    return curr;
  }

  get artifact(): InteractionArtifact {
    const currentNode = this.provenance.current;

    if (isChildNode(currentNode)) {
      const artifacts = this.provenance.getLatestArtifact(currentNode.id);

      if (!artifacts)
        return {
          predictions: [],
          interactions: [],
        };

      return artifacts.artifact;
    }

    return {
      predictions: [],
      interactions: [],
    };
  }

  get predictions(): Predictions {
    return this.artifact.predictions;
  }

  get interactions(): Interactions {
    return this.artifact.interactions;
  }

  get loadedDatasetKey() {
    const { datasetKey } = this.state;

    if (!datasetKey) throw new Error();

    return datasetKey;
  }

  get selectedPoints() {
    let selectedPoints: string[] = [];
    const { plots } = this.state;

    Object.values(plots).forEach((plot) => {
      selectedPoints.push(...plot.selectedPoints);

      const brushes = plot.brushes;
      Object.values(brushes).forEach((brush) => {
        if (brush.points) selectedPoints.push(...brush.points);
      });
    });

    const { selectedPrediction } = this.state;

    if (!isEmptyOrNull(selectedPrediction))
      selectedPoints = [...selectedPoints, ...selectedPrediction.memberIds];

    return Array.from(new Set(selectedPoints));
  }

  get n_plots() {
    return Object.values(this.state.plots).length;
  }

  get plots() {
    return Object.values(toJS(this.state.plots));
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
  // ########################### Store actions ########################### //
  // ##################################################################### //

  setMatchLegendVisibility = (visible: boolean) => {
    this.showMatchesLegend = visible;
  };

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

  changeCategory = (category: string) => {
    const { changeCategoryAction } = this.rootStore.actions;

    changeCategoryAction.setLabel(`Category: ${category}`);
    this.provenance.apply(changeCategoryAction(category));
    this.addInteraction({ type: 'ChangeCategory', category });
    this.rootStore.currentNodes.push(this.provenance.graph.current);
  };

  toggleCategories = (show: boolean, categories: string[] = []) => {
    const { toggleCategoryAction } = this.rootStore.actions;

    if (!show) {
      toggleCategoryAction.setLabel('Hide Categories');
      this.provenance.apply(toggleCategoryAction(show, ''));
      this.addInteraction({ type: 'ToggleCategory', show });

      return;
    }

    if (categories.length === 0) throw new Error('No category columns');

    let category = categories[0];

    if (this.state.categoryColumn !== '') category = this.state.categoryColumn;

    toggleCategoryAction.setLabel('Show Categories');
    this.provenance.apply(toggleCategoryAction(show, category));
    this.addInteraction({ type: 'ToggleCategory', show });
    this.addInteraction({ type: 'ChangeCategory', category });
    this.rootStore.currentNodes.push(this.provenance.graph.current);
  };

  // ##################################################################### //
  // ######################### Provenance Helpers ######################## //
  // ##################################################################### //

  addInteraction = (interaction: BaseInteraction) => {
    const { current } = this.provenance;

    let interactions = this.artifact.interactions;

    if (isChildNode(current)) {
      const parentId = current.parent;
      const artifacts = this.provenance.getLatestArtifact(parentId);

      if (artifacts) {
        interactions = artifacts.artifact.interactions;
      }
    }

    const id = this.provenance.current.id;

    interactions.push({ id, ...interaction });

    this.provenance.addArtifact({
      ...this.artifact,
      interactions,
    });
    console.log(toJS(this.artifact.interactions));
  };

  addPredictions = () => {
    const dimensions: string[] = [];

    Object.values(this.state.plots).forEach((plt) => {
      dimensions.push(...[plt.x, plt.y]);
    });

    Axios.post(
      `http://127.0.0.1:5000/${this.currentProject.key}/dataset/predict/${this.loadedDatasetKey}`,
      {
        selections: this.selectedPoints,
        dimensions,
      },
    ).then(
      action((response: AxiosResponse<Predictions>) => {
        const { data = [] } = response;
        this.provenance.addArtifact({ ...this.artifact, predictions: data });
      }),
    );
  };

  goToNode = (id: NodeID): void => {
    this.provenance.goToNode(id);
  };
}
