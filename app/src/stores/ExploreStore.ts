/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { isChildNode, NodeID } from '@visdesignlab/trrack';
import { extent, max, mean, median, min, sum } from 'd3';
import { action, makeAutoObservable, reaction, runInAction, when } from 'mobx';

import { BrushSize } from '../components/Brushes/FreeFormBrush';
import {
  BrushAffectType,
  BrushCollection,
} from '../components/Brushes/Rectangular Brush/Types/Brush';
import { ScatterplotPoint } from '../components/Scatterplot/Scatterplot';
import {
  extentToBrushExtent,
  getSelectedPoints,
  Interactions,
  ScatterplotSpec,
  Selection,
} from '../types/Interactions';
import { Prediction } from '../types/Prediction';
import deepCopy from '../utils/DeepCopy';
import { getAggregateID, getPlotId } from '../utils/IDGens';

import { AggMap } from './../contexts/CategoryContext';
import {
  addAggregate,
  addBrush,
  addFilter,
  addPointSelection,
  addScatterplot,
  assignLabel,
  removeBrush,
  updateBrush,
} from './provenance/actions';
import { queryPrediction } from './queries/queryPrediction';
import RootStore from './RootStore';
import { DataPoint } from './types/Dataset';
import {
  clearSelections,
  defaultViewState,
  getDimensions,
  getSelections,
  getView,
  PCPView,
  ScatterplotView,
  View,
  ViewState,
} from './ViewState';

export const CUSTOM_LABEL = 'customlabel';
export const CUSTOM_CATEGORY_ASSIGNMENT = 'customCategoryAssignment';

type DatasetRecord = Record<string, StateRecord>;

type StateRecord = Record<NodeID, ViewState>;

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
  record: DatasetRecord = {};

  constructor(root: RootStore) {
    this.root = root;

    makeAutoObservable(this, {
      getState: action,
      updateVisState: action,
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
        interactions: this.provenance.getState(this.provenance.current.id).interactions,
      }),
      (args) => {
        if (args.dataset_id) this.refreshPrediction();
      },
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

  computeDataPoints(state: ViewState, rawDataPoints: DataPoint[], applyTransforms = true) {
    if (rawDataPoints.length === 0) return rawDataPoints;

    const data: { [k: string]: DataPoint } = {};

    rawDataPoints
      .filter((d) => !state.filteredPoints.includes(d.id))
      .forEach((d) => (data[d.id] = d));

    if (applyTransforms) {
      const { labels, categoryAssignments } = state;

      Object.entries(labels).forEach(([label, points]) => {
        points.forEach((p) => {
          if (!data[p][CUSTOM_LABEL]) data[p] = { ...data[p], [CUSTOM_LABEL]: [label] };
          else data[p][CUSTOM_LABEL].push(label);
        });
      });

      Object.entries(categoryAssignments).forEach(([category, valueMap]) => {
        Object.entries(valueMap).forEach(([value, points]) => {
          points.forEach((p) => {
            const d = data[p];

            if (!d[CUSTOM_CATEGORY_ASSIGNMENT]) d[CUSTOM_CATEGORY_ASSIGNMENT] = {};

            d[CUSTOM_CATEGORY_ASSIGNMENT][category] = value;

            data[p] = d;
          });
        });
      });
    }

    return Object.values(data);
  }

  get aggregate() {
    if (!this.data) return [];
    const points: DataPoint[] = [];
    const data = this.computeDataPoints(this.state, this.rawDataPoints, false);

    const { numericColumns, categoricalColumns, labelColumn } = this.data;

    const { aggregates } = this.state;

    Object.entries(aggregates).forEach(([id, agg]) => {
      const memberPoints = data.filter((d) => agg.values.includes(d.id));
      const point: DataPoint = {
        id,
        iid: id,
      };

      numericColumns.forEach((col) => {
        switch (agg.map[col]) {
          case 'Max':
            point[col] = max(memberPoints.map((d) => d[col]));
            break;
          case 'Min':
            point[col] = min(memberPoints.map((d) => d[col]));
            break;
          case 'Median':
            point[col] = median(memberPoints.map((d) => d[col]));
            break;
          case 'Mean':
            point[col] = mean(memberPoints.map((d) => d[col]));
            break;
          case 'Sum':
            point[col] = sum(memberPoints.map((d) => d[col]));
            break;
        }
      });

      categoricalColumns.forEach((col) => (point[col] = 'NA'));

      point[labelColumn] = agg.name;

      points.push(point);
    });

    return points;
  }

  get doesHaveCategories() {
    if (!this.data) return false;

    return this.data.categoricalColumns.length > 0;
  }

  get state() {
    const id = this.provenance.current.id;
    const st = this.getState(id);

    const scatterplots = Object.values(st.views).filter(
      (c) => c.type === 'Scatterplot',
    ) as ScatterplotView[];
    const pcps = Object.values(st.views).filter((c) => c.type === 'PCP') as PCPView[];

    return { ...st, scatterplots, pcps };
  }

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

  handleIntentSelection = (prediction: Prediction) => {};

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
  refreshPrediction = async () => {
    runInAction(() => {
      this.predictions.isLoading = true;
    });
    const selections = getSelections(this.state);
    const dimensions = getDimensions(this.state);
    const dataValues = this.dataPoints;

    const data = await this.query.fetchQuery(
      ['predictions', this.datasetId, selections, dimensions, dataValues],
      () => queryPrediction(dataValues, dimensions, selections),
    );

    runInAction(() => {
      this.predictions = { isLoading: false, values: data };
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
  };

  updateVisState = (_state: ViewState, interactions: Interactions): ViewState => {
    let state = deepCopy(_state);
    const latest = interactions[interactions.length - 1];
    const currState = JSON.parse(JSON.stringify(state));

    switch (latest.i_type) {
      case 'ViewSpec':
        state.views[latest.id] = getView(latest);
        break;
      // View Spec Ends
      case 'Selection': {
        switch (latest.type) {
          case 'Point': {
            let currSels = state.freeformSelections;

            switch (latest.action) {
              case 'Selection': {
                currSels.push(...latest.ids);

                break;
              }
              case 'Deselection': {
                currSels = [...new Set(currSels.filter((p) => !latest.ids.includes(p)))];

                break;
              }
            }

            state.freeformSelections = [...new Set(currSels)];

            break;
          }
          case 'Range': {
            const brush_id = latest.rangeId;
            const view_id = latest.view;
            const spec = state.views[latest.view].spec;

            switch (latest.action) {
              case 'Add':
              case 'Update': {
                const { extents } = latest;

                if (spec.type === 'Scatterplot') {
                  const { x1, x2, y1, y2 } = extentToBrushExtent(
                    extents,
                    spec.dimensions[0],
                    spec.dimensions[1],
                  );

                  const selectedIds = getSelectedPoints(
                    extents,
                    this.computeDataPoints(currState, this.rawDataPoints, false),
                    spec.dimensions[0],
                    spec.dimensions[1],
                  );

                  state.views[view_id].brushes[brush_id] = {
                    id: brush_id,
                    extents: { x1, x2, y1, y2 },
                  };

                  state.views[view_id].brushSelections[brush_id] = selectedIds;
                } else {
                  // ! Implement PCP Brush
                }

                break;
              }
              case 'Remove': {
                // ! Deleting doesnt recreate brush
                delete state.views[view_id].brushes[brush_id];
                delete state.views[view_id].brushSelections[brush_id];

                break;
              }
            }

            break;
          }
        }

        break;
      }
      case 'Filter': {
        const { action } = latest;
        const filteredPoints = state.filteredPoints;
        const sels = getSelections(state);

        if (action === 'In') {
          const filterOut = this.rawDataPoints.filter((d) => !sels.includes(d.id)).map((d) => d.id);
          state.filteredPoints.push(...filterOut);
        } else {
          state.filteredPoints.push(...sels);
        }

        state.filteredPoints = filteredPoints;
        state = clearSelections(state);

        break;
      }
      case 'Label': {
        const { as } = latest;

        const sels = getSelections(state);

        if (!state.labels[as]) state.labels[as] = [];

        state.labels[as].push(...sels);

        state = clearSelections(state);

        break;
      }
      case 'Aggregation': {
        const { id, name, rules } = latest;

        const sels = getSelections(state);

        state.aggregates[id] = {
          replace: false,
          name,
          map: rules,
          values: sels,
        };

        state = clearSelections(state);

        break;
      }
      default:
        break;
    }

    return state;
  };

  getState = (nodeid: NodeID): ViewState => {
    if (!this.datasetId) return defaultViewState;

    let stateRecord = this.record[this.datasetId];

    const current = this.provenance.graph.nodes[nodeid];

    if (!stateRecord) {
      stateRecord = {};
      this.record[this.datasetId] = stateRecord;
    }

    let visState = stateRecord[current.id];

    if (!visState) {
      if (isChildNode(current)) {
        const parentVisState = this.getState(current.parent);
        const { interactions } = this.provenance.getState(current);
        visState = this.updateVisState(parentVisState, interactions);
      } else {
        visState = deepCopy(defaultViewState);
      }

      this.record[this.datasetId][current.id] = visState;

      return deepCopy(this.record[this.datasetId][current.id]);
    }

    return visState;
  };
}

// Applying action in provenance triggers a reaction,
// This checks if the visState is available for current node,
// If yes, return
// If not, then go and calculate it recursively
