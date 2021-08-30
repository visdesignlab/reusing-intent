/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NodeID } from '@visdesignlab/trrack';
import { extent } from 'd3';
import { action, makeAutoObservable, reaction, runInAction, toJS, when } from 'mobx';

import { BrushSize } from '../components/Brushes/FreeFormBrush';
import {
  BrushAffectType,
  BrushCollection,
} from '../components/Brushes/Rectangular Brush/Types/Brush';
import { ScatterplotPoint } from '../components/Scatterplot/Scatterplot';
import { ScatterplotSpec, Selection } from '../types/Interactions';
import { Prediction, predictionToIntent } from '../types/Prediction';
import { getAggregateID, getPlotId } from '../utils/IDGens';

import { AggMap } from './../contexts/CategoryContext';
import {
  addAggregate,
  addBrush,
  addFilter,
  addIntentSelection,
  addPointSelection,
  addScatterplot,
  assignLabel,
  removeBrush,
  removeScatterplot,
  updateBrush,
} from './provenance/actions';
import { queryPrediction } from './queries/queryPrediction';
import RootStore from './RootStore';
import { DataPoint } from './types/Dataset';
import { ReapplyGraph } from './types/Provenance';
import {
  defaultViewState,
  getDimensions,
  getSelections,
  PCPView,
  queryState,
  ScatterplotView,
  View,
  ViewState,
} from './ViewState';

export const CUSTOM_LABEL = 'customlabel';
export const CUSTOM_CATEGORY_ASSIGNMENT = 'customCategoryAssignment';

export type StateRecord = Record<NodeID, ViewState>;

export type FreeFormBrushType = 'Freeform Small' | 'Freeform Medium' | 'Freeform Large';

export type BrushType = FreeFormBrushType | 'Rectangular' | 'None';

export const BrushSizeMap: { [key in FreeFormBrushType]: BrushSize } = {
  'Freeform Small': 20,
  'Freeform Medium': 35,
  'Freeform Large': 50,
};

export type HighlightPredicate = (point: ScatterplotPoint) => boolean;
export type ColorPredicate = (point: ScatterplotPoint) => string;

export default class ExploreStore {
  root: RootStore;
  plotType: 'scatterplot' | 'pcp' | 'none' = 'none';
  showCategories = false;
  selectedCategoryColumn: string | null = null;
  brushType: BrushType = 'Freeform Medium';
  showLabelLayer = true;
  highlightMode = false;
  highlightPredicate: HighlightPredicate | null = null;
  colorPredicate: ColorPredicate | null = null;
  hideAggregateMembers = false;
  showMatchesLegend = false;
  predictions: {
    isLoading: boolean;
    values: Prediction[];
  } = { isLoading: false, values: [] };

  // Vis state
  record: StateRecord = {};
  lastAccessed = '';

  constructor(root: RootStore) {
    this.root = root;

    makeAutoObservable(this, {
      // getState: action,
      updateRecord: action,
      stateHelper: action,
      refreshPrediction: action,
      toggleShowCategories: action,
      switchBrush: action,
      toggleLabelLayer: action,
      toggleHideAggregateMembers: action,
    });

    // If category is toggled on first time, load the default category column and dispose self
    const category_reaction = when(
      () => this.showCategories && this.data !== null,
      () => {
        if (this.data && this.doesHaveCategories && this.selectedCategoryColumn === null) {
          this.selectedCategoryColumn = this.data.categoricalColumns[0];
        }
      },
    );

    // Once data is loaded and it does not have categories, dispose category_reaction, then dispose self
    reaction(
      () => this.data,
      (arg, _, r) => {
        if (arg) {
          if (!this.doesHaveCategories) {
            category_reaction();
          }
          r.dispose();
        }
      },
    );

    reaction(
      () => ({
        dataset_id: this.datasetId,
        provenance: Object.values(this.provenance.graph.nodes).length,
      }),
      ({ dataset_id }) => {
        if (dataset_id) this.updateRecord(dataset_id, this.provenance.graph);
      },
    );

    reaction(
      () => this.state,
      (st) => this.refreshPrediction(st),
    );

    if (root.opts.debug === 'on') {
      this.toggleShowCategories(root.opts.showCategories);
      const btype = localStorage.getItem('btype');
      this.switchBrush(((btype as unknown) || this.brushType) as BrushType);
    }
  }

  // Getters
  get query() {
    return this.root.query;
  }

  get datasetId() {
    return this.root.projectStore.dataset_id;
  }

  get data() {
    return this.root.projectStore.data;
  }

  get rawDataPoints() {
    return this.data?.values || [];
  }

  get rangeMap() {
    if (!this.data) return {};

    const { columnInfo, values = [] } = this.data;

    const m: { [k: string]: { min: number; max: number } } = {};

    Object.keys(columnInfo).forEach((col) => {
      const [min = -1, max = -1] = extent(values.map((v) => v[col]) as number[]);

      m[col] = { min, max };
    });

    return m;
  }

  get dataPoints() {
    return this.computeDataPoints(this.state, this.rawDataPoints);
  }

  get aggregateDataPoints() {
    const { aggregates } = this.state;

    const agg: DataPoint[] = [];

    Object.values(aggregates).forEach((a) => {
      agg.push(a.aggregate);
    });

    return agg;
  }

  computeDataPoints(state: ViewState, rawDataPoints: DataPoint[], applyTransforms = true) {
    if (rawDataPoints.length === 0) return rawDataPoints;

    const data: { [k: string]: DataPoint } = {};

    rawDataPoints
      .filter((d) => !state.filteredPoints.includes(d.id))
      .forEach((pt) => {
        data[pt.id] = toJS(pt);
      });

    if (applyTransforms) {
      Object.entries(state.labels).forEach(([label, ids]) => {
        ids.forEach((id) => {
          if (!data[id][CUSTOM_LABEL]) data[id][CUSTOM_LABEL] = [label];
          else data[id][CUSTOM_LABEL].push(label);
        });
      });
    }

    return Object.values(data);
  }

  get doesHaveCategories() {
    if (!this.data) return false;

    return this.data.categoricalColumns.length > 0;
  }

  get state() {
    const id = this.provenance.graph.current;
    const record = this.record[id];

    return this.stateHelper(id, record);
  }

  stateHelper = (id: NodeID, state?: ViewState) => {
    let st: ViewState =
      this.lastAccessed !== '' ? toJS(this.record[this.lastAccessed]) : defaultViewState;

    if (state) {
      st = toJS(state);
      this.lastAccessed = id;
    }

    const scatterplots = Object.values(st.views).filter(
      (c) => c.type === 'Scatterplot',
    ) as ScatterplotView[];
    const pcps = Object.values(st.views).filter((c) => c.type === 'PCP') as PCPView[];

    return { ...st, scatterplots, pcps };
  };

  get provenance() {
    return this.root.provenance;
  }

  // Provenance Actions
  addScatterplot = (x?: string, y?: string) => {
    if (!this.data) return;

    if (this.plotType === 'none') {
      this.plotType = 'scatterplot';
    }

    if (!x || !y) {
      const spec: ScatterplotSpec = {
        i_type: 'ViewSpec',
        id: getPlotId(),
        type: 'Scatterplot',
        action: 'Add',
        dimensions: [this.data.numericColumns[0], this.data.numericColumns[1]],
      };

      this.provenance.apply(
        addScatterplot(spec),
        `Adding scatterplot for ${spec.dimensions[0]}-${spec.dimensions[1]}`,
      );
    } else {
      const spec: ScatterplotSpec = {
        i_type: 'ViewSpec',
        id: getPlotId(),
        action: 'Add',
        type: 'Scatterplot',
        dimensions: [x, y],
      };

      this.provenance.apply(addScatterplot(spec), `Adding scatterplot for ${x}-${y}`);
    }
  };

  removeScatterplot = (id: string) => {
    this.provenance.apply(
      removeScatterplot({
        i_type: 'ViewSpec',
        id,
        action: 'Remove',
        type: 'Scatterplot',
        dimensions: [],
      }),
      'Remove Scatterplot',
    );
  };

  selectPointsFreeform = (points: string[], view: View) => {
    if (!this.data) return;

    const spec = view.spec;

    const pointSelection: Selection = {
      i_type: 'Selection',
      type: 'Point',
      action: 'Selection',
      ids: points,
    };

    this.provenance.apply(addPointSelection(pointSelection), `Select ${points.length} points`);
  };

  unselectPointsFreeform = (points: string[], view: View) => {
    if (!this.data) return;
    const spec = view.spec;

    const currentViewSelections = this.state.freeformSelections;

    const ids = points.filter((p) => currentViewSelections.includes(p));

    const pointSelection: Selection = {
      i_type: 'Selection',
      type: 'Point',
      action: 'Deselection',
      ids,
    };

    this.provenance.apply(addPointSelection(pointSelection), `Unselect ${ids.length} points`);
  };

  handleBrushSelection = (
    _spec: View,
    brushes: BrushCollection,
    type: BrushAffectType,
    affectedId: string,
  ) => {
    const currentBrush = brushes[affectedId];

    const spec = _spec.spec;

    switch (type) {
      case 'Add': {
        const { x1, x2, y1, y2 } = currentBrush.extents;

        if (spec.type === 'Scatterplot') {
          const extents = {
            [spec.dimensions[0]]: { min: x1, max: x2 },
            [spec.dimensions[1]]: { min: y1, max: y2 },
          };

          const interaction: Selection = {
            i_type: 'Selection',
            type: 'Range',
            rangeId: currentBrush.id,
            action: 'Add',
            view: spec.id,
            extents,
          };

          this.provenance.apply(addBrush(interaction), 'Add Brush');
        }
        break;
      }
      case 'Update': {
        const { x1, x2, y1, y2 } = currentBrush.extents;

        if (spec.type === 'Scatterplot') {
          const extents = {
            [spec.dimensions[0]]: { min: x1, max: x2 },
            [spec.dimensions[1]]: { min: y1, max: y2 },
          };

          this.provenance.apply(
            updateBrush({
              i_type: 'Selection',
              type: 'Range',
              view: spec.id,
              rangeId: currentBrush.id,
              action: 'Update',
              extents,
            }),
            'Update Brush',
          );
        }
        break;
      }
      case 'Remove':
        this.provenance.apply(
          removeBrush({
            i_type: 'Selection',
            type: 'Range',
            rangeId: affectedId,
            action: 'Remove',
            view: spec.id,
            extents: {},
          }),
          'Remove Brush',
        );
        break;
      case 'Clear':
      default:
        break;
    }
  };

  handleIntentSelection = (prediction: Prediction) => {
    this.provenance.apply(
      addIntentSelection({
        i_type: 'Selection',
        type: 'Algorithmic',
        apply: predictionToIntent(prediction),
      }),
      `Apply ${prediction.intent} selection`,
    );
  };

  handleFilter = (filterType: 'In' | 'Out') => {
    this.provenance.apply(
      addFilter({
        i_type: 'Filter',
        action: filterType,
      }),
      `Filter ${filterType}`,
    );
  };

  handleLabelling = (label: string) => {
    this.provenance.apply(
      assignLabel({
        i_type: 'Label',
        as: label,
      }),
      `Assign label ${label}`,
    );
  };

  handleCategorization = (category: string, value: string) => {};

  handleAggregate = (name: string, aggOptions: AggMap, drop = false) => {
    this.provenance.apply(
      addAggregate({
        i_type: 'Aggregation',
        name,
        id: getAggregateID(),
        drop,
        rules: aggOptions,
      }),
    );
  };

  // Mobx Actions
  refreshPrediction = (state: ViewState) => {
    const selections = getSelections(state);
    const dimensions = getDimensions(state);
    const dataValues = this.dataPoints;

    if (selections.length === 0) {
      runInAction(
        () =>
          (this.predictions = {
            isLoading: false,
            values: [],
          }),
      );

      return;
    }

    runInAction(() => {
      this.predictions.isLoading = true;
    });

    this.query
      .fetchQuery(['predictions', this.datasetId, selections, dimensions, dataValues], () =>
        queryPrediction(dataValues, dimensions, selections),
      )
      .then((pred) => {
        runInAction(() => {
          this.predictions = { isLoading: false, values: pred };
        });
      });
  };

  toggleHideAggregateMembers = () => (this.hideAggregateMembers = !this.hideAggregateMembers);

  toggleLabelLayer = (show?: boolean) => {
    if (show) this.showLabelLayer = show;
    else this.showLabelLayer = !this.showLabelLayer;
  };

  switchBrush = (btype: BrushType) => {
    if (this.root.opts.debug === 'on') {
      localStorage.setItem('btype', btype);
    }

    this.brushType = btype;
  };

  toggleShowCategories = (show: unknown | null = null) => {
    if (typeof show === 'boolean') {
      this.showCategories = show;
    } else {
      this.showCategories = !this.showCategories;
    }
  };

  setHighlightMode = (highlight: boolean) => (this.highlightMode = highlight);

  setHighlightPredicate = (predicate: HighlightPredicate | null) =>
    (this.highlightPredicate = predicate);

  setColorPredicate = (predicate: ColorPredicate | null) => (this.colorPredicate = predicate);

  setShowMatchesLegend = (show: boolean) => (this.showMatchesLegend = show);

  changeCategoryColumn = (col: string | null) => {
    if (!this.data || !col) return;

    if (this.data.categoricalColumns.includes(col)) this.selectedCategoryColumn = col;
    else throw new Error('Undefined column');

    localStorage.setItem('category-column', col);
  };

  updateRecord = (dataset_id: string, graph: ReapplyGraph) => {
    this.query
      .fetchQuery(['state', dataset_id, graph], () => queryState(this.rawDataPoints, graph))
      .then((rec) => {
        runInAction(() => {
          this.record = rec;
        });
      });
  };
}

// Applying action in provenance triggers a reaction,
// This checks if the visState is available for current node,
// If yes, return
// If not, then go and calculate it recursively
