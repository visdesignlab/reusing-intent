/* eslint-disable @typescript-eslint/no-unused-vars */
import { isChildNode, NodeID } from '@visdesignlab/trrack';
import Axios, { AxiosResponse } from 'axios';
import { action, makeAutoObservable, toJS } from 'mobx';

import { isEmptyOrNull } from '../Utils/isEmpty';

import { RootStore } from './Store';
import { InteractionArtifact } from './Types/InteractionArtifact';
import { Interaction, Interactions } from './Types/Interactions';
import { Plot } from './Types/Plot';
import { Prediction, Predictions } from './Types/Prediction';

export class ExploreStore {
  rootStore: RootStore;
  showMatchesLegend = false;
  isLoadingData = false;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.provenance.addGlobalObserver(() => console.log(toJS(this.interactions)));
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

    this.state.plots.forEach((plot) => {
      selectedPoints.push(...plot.selectedPoints);
    });

    const { selectedPrediction } = this.state;

    if (!isEmptyOrNull(selectedPrediction))
      selectedPoints = [...selectedPoints, ...selectedPrediction.memberIds];

    return Array.from(new Set(selectedPoints));
  }

  get n_plots() {
    return this.state.plots.length;
  }

  get loadedDataset() {
    const dataset = this.rootStore.projectStore.loadedDataset;

    if (!dataset) throw new Error('Dataset not loaded');

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
    this.rootStore.provenanceActions.addPlotAction.setLabel('Add Plot');
    this.provenance.apply(this.rootStore.provenanceActions.addPlotAction(plot));
    this.addInteraction({ type: 'AddPlot', plot });
    this.rootStore.currentNodes.push(this.provenance.graph.current);
  };

  removePlot = (plot: Plot) => {
    this.rootStore.provenanceActions.removePlotAction.setLabel(
      `Remove plot: ${plot.x} - ${plot.y}`,
    );
    this.provenance.apply(this.rootStore.provenanceActions.removePlotAction(plot));

    this.rootStore.currentNodes.push(this.provenance.graph.current);
  };

  setFreeformSelection = (plot: Plot, points: string[]) => {
    this.addPointSelection(plot, points, true);
  };

  addPointSelection = (plot: Plot, points: string[], isPaintBrush = false) => {
    if (points.length === 0) return;

    this.rootStore.provenanceActions.pointSelectionAction.setLabel(
      isPaintBrush ? `P. Brush: ${points.length}` : `Add Point Selection`,
    );
    this.provenance.apply(this.rootStore.provenanceActions.pointSelectionAction(plot, points));

    this.addInteraction({ type: 'PointSelection', selected: points, plot });
    this.addPredictions();

    this.rootStore.currentNodes.push(this.provenance.graph.current);
  };

  setPredictionSelection = (prediction: Prediction) => {
    this.rootStore.provenanceActions.predictionSelectionAction.setLabel(
      `${prediction.intent} Selection`,
    );
    this.provenance.apply(this.rootStore.provenanceActions.predictionSelectionAction(prediction));
  };

  changeCategory = (category: string) => {
    this.rootStore.provenanceActions.changeCategoryAction.setLabel(`Category: ${category}`);
    this.provenance.apply(this.rootStore.provenanceActions.changeCategoryAction(category));
    this.addInteraction({ type: 'ChangeCategory', category });
    this.rootStore.currentNodes.push(this.provenance.graph.current);
  };

  toggleCategories = (show: boolean, categories: string[] = []) => {
    if (!show) {
      this.rootStore.provenanceActions.toggleCategoryAction.setLabel('Hide Categories');
      this.provenance.apply(this.rootStore.provenanceActions.toggleCategoryAction(show, ''));
      this.addInteraction({ type: 'ToggleCategory', show });

      return;
    }

    if (categories.length === 0) throw new Error('No category columns');

    let category = categories[0];

    if (this.state.categoryColumn !== '') category = this.state.categoryColumn;

    this.rootStore.provenanceActions.toggleCategoryAction.setLabel('Show Categories');
    this.provenance.apply(this.rootStore.provenanceActions.toggleCategoryAction(show, category));
    this.addInteraction({ type: 'ToggleCategory', show });
    this.addInteraction({ type: 'ChangeCategory', category });
    this.rootStore.currentNodes.push(this.provenance.graph.current);
  };

  // ##################################################################### //
  // ######################### Provenance Helpers ######################## //
  // ##################################################################### //

  addInteraction = (interaction: Interaction) => {
    const interactions = this.artifact.interactions;
    interactions.push(interaction);

    this.provenance.addArtifact({
      ...this.artifact,
      interactions,
    });
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
