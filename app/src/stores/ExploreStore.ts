import { isChildNode, NodeID } from '@visdesignlab/trrack';
import { action, makeAutoObservable, reaction, when } from 'mobx';

import {
  BrushAffectType,
  BrushCollection,
} from '../components/Brushes/Rectangular Brush/Types/Brush';
import { SPView } from '../components/Scatterplot/Scatterplot';
import { Interactions, PCPSpec, ScatterplotSpec, ViewSpec } from '../types/Interactions';
import deepCopy from '../utils/DeepCopy';
import { getPlotId } from '../utils/IDGens';

import { PointSelection } from './../types/Interactions';
import {
  addBrush,
  addPointSelection,
  addScatterplot,
  removeBrush,
  updateBrush,
} from './provenance/actions';
import RootStore from './RootStore';

// Temp
type PCPView = PCPSpec & {
  freeformSelections: string[];
  brushes: BrushCollection;
  brushSelections: { [key: string]: string[] };
};

type View = SPView | PCPView;

type VisState = {
  views: {
    [key: string]: View;
  };
};

const defaultVisState: VisState = {
  views: {},
};

type DatasetRecord = Record<string, StateRecord>;

type StateRecord = Record<NodeID, VisState>;

export default class ExploreStore {
  root: RootStore;
  plotType: 'scatterplot' | 'pcp' | 'none' = 'none';
  showCategories = false;
  selectedCategoryColumn: string | null = null;

  // Vis state
  record: DatasetRecord = {};

  constructor(root: RootStore) {
    this.root = root;

    makeAutoObservable(this, {
      getState: action,
      updateVisState: action,
      toggleShowCategories: action,
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

    if (root.opts.debug) {
      this.showCategories = root.opts.showCategories;
    }
  }

  // Getters
  get datasetId() {
    return this.root.projectStore.dataset_id;
  }

  get data() {
    return this.root.projectStore.data;
  }

  get doesHaveCategories() {
    if (!this.data) return false;

    return this.data.categoricalColumns.length > 0;
  }

  get state() {
    return this.getState(this.provenance.current.id);
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
        x: this.data.numericColumns[0],
        y: this.data.numericColumns[1],
      };

      this.provenance.apply(addScatterplot(spec), `Adding scatterplot for ${spec.x}-${spec.y}`);
    } else {
      const spec: ScatterplotSpec = {
        i_type: 'ViewSpec',
        id: getPlotId(),
        type: 'Scatterplot',
        x,
        y,
      };

      this.provenance.apply(addScatterplot(spec), `Adding scatterplot for ${spec.x}-${spec.y}`);
    }
  };

  selectPointsFreeform = (points: string[], view: ViewSpec) => {
    if (!this.data) return;

    const pointSelection: PointSelection = {
      i_type: 'PointSelection',
      type: 'Selection',
      view,
      ids: points,
    };

    this.provenance.apply(addPointSelection(pointSelection), `Select ${points.length} points`);
  };

  unselectPointsFreeform = (points: string[], view: ViewSpec) => {
    if (!this.data) return;

    const currentViewSelections = this.state.views[view.id].freeformSelections;

    const ids = points.filter((p) => currentViewSelections.includes(p));

    const pointSelection: PointSelection = {
      i_type: 'PointSelection',
      type: 'Deselection',
      view,
      ids,
    };

    this.provenance.apply(addPointSelection(pointSelection), `Unselect ${ids.length} points`);
  };

  handleBrushSelection = (
    view: ViewSpec,
    brushes: BrushCollection,
    type: BrushAffectType,
    affectedId: string,
  ) => {
    const currentBrush = brushes[affectedId];

    switch (type) {
      case 'Add': {
        const { x1, x2, y1, y2 } = currentBrush.extents;

        const v = view as ScatterplotSpec;

        const extent = {
          [v.x]: {
            min: x1,
            max: x2,
          },
          [v.y]: {
            min: y1,
            max: y2,
          },
        };
        this.provenance.apply(
          addBrush({
            i_type: 'BrushSelection',
            view,
            id: currentBrush.id,
            extents: extent,
            type: 'Add',
          }),
          'Add Brush',
        );
        break;
      }
      case 'Update': {
        const { x1, x2, y1, y2 } = currentBrush.extents;

        const v = view as ScatterplotSpec;

        const extent = {
          [v.x]: {
            min: x1,
            max: x2,
          },
          [v.y]: {
            min: y1,
            max: y2,
          },
        };
        this.provenance.apply(
          updateBrush({
            i_type: 'BrushSelection',
            id: currentBrush.id,
            extents: extent,
            type: 'Update',
            view,
          }),
          'Update Brush',
        );
        break;
      }
      case 'Remove':
        this.provenance.apply(
          removeBrush({
            i_type: 'BrushSelection',
            id: affectedId,
            view,
            type: 'Remove',
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

  // Mobx Actions
  toggleShowCategories = () => {
    this.showCategories = !this.showCategories;
  };

  changeCategoryColumn = (col: string | null) => {
    if (!this.data || !col) return;

    if (this.data.categoricalColumns.includes(col)) this.selectedCategoryColumn = col;
    else throw new Error('Undefined column');
  };

  updateVisState = (state: VisState, interactions: Interactions): VisState => {
    const latest = interactions[interactions.length - 1];

    switch (latest.i_type) {
      case 'ViewSpec':
        state.views[latest.id] = {
          ...latest,
          freeformSelections: [],
          brushes: {},
          brushSelections: {},
        };
        break;
      case 'PointSelection': {
        const view_id = latest.view.id;
        const priorSels = state.views[view_id].freeformSelections;

        if (latest.type === 'Selection') {
          priorSels.push(...latest.ids);
          state.views[view_id].freeformSelections = [...new Set(priorSels)];
        } else {
          const newSels = priorSels.filter((p) => !latest.ids.includes(p));
          state.views[view_id].freeformSelections = [...new Set(newSels)];
        }
        break;
      }
      case 'BrushSelection': {
        const {
          view: { id: view_id },
          type,
          id: brush_id,
        } = latest;

        switch (type) {
          case 'Add':
          case 'Update': {
            const { view, extents } = latest;

            const v = view as ScatterplotSpec;

            const [x1, x2, y1, y2] = [
              extents[v.x].min,
              extents[v.x].max,
              extents[v.y].min,
              extents[v.y].max,
            ];
            state.views[view_id].brushes[brush_id] = {
              id: brush_id,
              extents: {
                x1,
                x2,
                y1,
                y2,
              },
            };

            const dataPoints = this.data?.values || [];

            const selected_ids: string[] = dataPoints
              .filter((point) => {
                const { x: x_col, y: y_col } = v;
                const [x, y] = [point[x_col] as number, point[y_col] as number];

                if (
                  x >= extents[x_col].min &&
                  x <= extents[x_col].max &&
                  y >= extents[y_col].min &&
                  y <= extents[y_col].max
                )
                  return true;

                return false;
              })
              .map((d) => d.id);

            state.views[view_id].brushSelections[brush_id] = selected_ids;
            break;
          }
          case 'Remove':
            if (state.views[view_id].brushes[brush_id])
              delete state.views[view_id].brushes[brush_id];

            if (state.views[view_id].brushSelections[brush_id])
              delete state.views[view_id].brushSelections[brush_id];
            break;
        }

        break;
      }
      default:
        break;
    }

    return state;
  };

  getState = (nodeid: NodeID): VisState => {
    if (!this.datasetId) return defaultVisState;

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
        visState = deepCopy(defaultVisState);
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
