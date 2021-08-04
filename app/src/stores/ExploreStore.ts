/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { isChildNode, NodeID } from '@visdesignlab/trrack';
import { extent } from 'd3';
import { action, makeAutoObservable, reaction, when } from 'mobx';

import { BrushSize } from '../components/Brushes/FreeFormBrush';
import {
  BrushAffectType,
  BrushCollection,
} from '../components/Brushes/Rectangular Brush/Types/Brush';
import {
  extentToBrushExtent,
  getDimensionsFromViewSpec,
  getSelectedPoints,
  Interactions,
  ScatterplotSpec,
  Selection,
} from '../types/Interactions';
import { Prediction } from '../types/Prediction';
import deepCopy from '../utils/DeepCopy';
import { getPlotId } from '../utils/IDGens';

import {
  addBrush,
  addFilter,
  addPointSelection,
  addScatterplot,
  removeBrush,
  updateBrush,
} from './provenance/actions';
import RootStore from './RootStore';
import { DataPoint } from './types/Dataset';
import {
  clearSelections,
  defaultViewState,
  getSelections,
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

export default class ExploreStore {
  root: RootStore;
  plotType: 'scatterplot' | 'pcp' | 'none' = 'none';
  showCategories = false;
  selectedCategoryColumn: string | null = null;
  brushType: BrushType = 'Freeform Medium';

  // Vis state
  record: DatasetRecord = {};

  constructor(root: RootStore) {
    this.root = root;

    makeAutoObservable(this, {
      getState: action,
      updateVisState: action,
      toggleShowCategories: action,
      switchBrush: action,
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

    if (root.opts.debug === 'on') {
      this.toggleShowCategories(root.opts.showCategories);
      const btype = localStorage.getItem('btype');
      this.switchBrush(((btype as unknown) || this.brushType) as BrushType);
    }
  }

  // Getters
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

  computeDataPoints(state: ViewState, rawDataPoints: DataPoint[]) {
    if (rawDataPoints.length === 0) return rawDataPoints;

    const data: { [k: string]: DataPoint } = {};

    rawDataPoints
      .filter((d) => !state.filteredPoints.includes(d.id))
      .forEach((d) => (data[d.id] = d));

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

    return Object.values(data);
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
        x: this.data.numericColumns[0],
        y: this.data.numericColumns[1],
      };

      this.provenance.apply(addScatterplot(spec), `Adding scatterplot for ${spec.x}-${spec.y}`);
    } else {
      const spec: ScatterplotSpec = {
        i_type: 'ViewSpec',
        id: getPlotId(),
        action: 'Add',
        type: 'Scatterplot',
        x,
        y,
      };

      this.provenance.apply(addScatterplot(spec), `Adding scatterplot for ${spec.x}-${spec.y}`);
    }
  };

  selectPointsFreeform = (points: string[], view: View) => {
    if (!this.data) return;

    const spec = view.spec;

    const pointSelection: Selection = {
      i_type: 'Selection',
      type: 'Point',
      action: 'Selection',
      spec,
      dimensions: getDimensionsFromViewSpec(spec),
      ids: points,
    };

    this.provenance.apply(addPointSelection(pointSelection), `Select ${points.length} points`);
  };

  unselectPointsFreeform = (points: string[], view: View) => {
    if (!this.data) return;
    const spec = view.spec;

    const currentViewSelections = this.state.views[spec.id].freeformSelections;

    const ids = points.filter((p) => currentViewSelections.includes(p));

    const pointSelection: Selection = {
      i_type: 'Selection',
      type: 'Point',
      action: 'Deselection',
      spec,
      dimensions: getDimensionsFromViewSpec(spec),
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
            [spec.x]: [x1, x2] as [number, number],
            [spec.y]: [y1, y2] as [number, number],
          };

          this.provenance.apply(
            addBrush({
              i_type: 'Selection',
              type: 'Brush',
              brushId: currentBrush.id,
              action: 'Add',
              spec,
              dimensions: getDimensionsFromViewSpec(spec),
              extents,
            }),
            'Add Brush',
          );
        }
        break;
      }
      case 'Update': {
        const { x1, x2, y1, y2 } = currentBrush.extents;

        if (spec.type === 'Scatterplot') {
          const extents = {
            [spec.x]: [x1, x2] as [number, number],
            [spec.y]: [y1, y2] as [number, number],
          };

          this.provenance.apply(
            updateBrush({
              i_type: 'Selection',
              type: 'Brush',
              brushId: currentBrush.id,
              action: 'Update',
              spec,
              dimensions: getDimensionsFromViewSpec(spec),
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
            type: 'Brush',
            brushId: affectedId,
            action: 'Remove',
            spec,
            dimensions: getDimensionsFromViewSpec(spec),
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

  handleLabelling = (label: string) => {};

  handleCategorization = (category: string, value: string) => {};

  handleAggregate = (by: 'Mean' | 'Median' | 'Sum' | 'Min' | 'Max') => {};

  handleReplace = (id: string, drop: true) => {};

  // Mobx Actions
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
        if (latest.type === 'Scatterplot') {
          state.views[latest.id] = {
            id: latest.id,
            type: 'Scatterplot',
            x: latest.x,
            y: latest.y,
            spec: latest,
            freeformSelections: [],
            brushes: {},
            brushSelections: {},
          };
        } else {
          state.views[latest.id] = {
            id: latest.id,
            type: 'PCP',
            spec: latest,
            dimensions: latest.dimensions,
            freeformSelections: [],
            brushes: {},
            brushSelections: {},
          };
        }
        break;
      // View Spec Ends
      case 'Selection': {
        const view_id = latest.spec.id;
        const view = state.views[view_id];

        switch (latest.type) {
          case 'Point': {
            let currSels = view.freeformSelections;

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

            state.views[view_id].freeformSelections = [...new Set(currSels)];

            break;
          }
          case 'Brush': {
            const brush_id = latest.brushId;

            switch (latest.action) {
              case 'Add':
              case 'Update': {
                const { extents } = latest;

                if (latest.spec.type === 'Scatterplot') {
                  const { x1, x2, y1, y2 } = extentToBrushExtent(
                    extents,
                    latest.spec.x,
                    latest.spec.y,
                  );

                  const selectedIds = getSelectedPoints(
                    extents,
                    this.computeDataPoints(currState, this.rawDataPoints),
                    latest.spec.x,
                    latest.spec.y,
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
