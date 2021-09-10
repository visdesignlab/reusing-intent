/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { initProvenance, isChildNode, NodeID } from '@visdesignlab/trrack';
import { extent } from 'd3';
import { action, makeAutoObservable, reaction, runInAction, toJS, when } from 'mobx';

import { BrushSize } from '../components/Brushes/FreeFormBrush';
import {
  BrushAffectType,
  BrushCollection,
} from '../components/Brushes/Rectangular Brush/Types/Brush';
import { ScatterplotPoint } from '../components/Scatterplot/Scatterplot';
import { checkIfWorkflowExists, loadWorkflowFromFirebase } from '../Firebase/firebase';
import { PCPSpec, ScatterplotSpec, Selection } from '../types/Interactions';
import { Prediction, predictionToIntent } from '../types/Prediction';
import { getAggregateID, getPlotId } from '../utils/IDGens';

import { AggMap } from './../contexts/CategoryContext';
import { OriginMap, Source } from './../library/trrack-vis/Utils/BundleMap';
import {
  addAggregate,
  addBrush,
  addFilter,
  addIntentSelection,
  addPCP,
  addPointSelection,
  addScatterplot,
  assignCategory,
  assignLabel,
  removeBrush,
  removeScatterplot,
  updateBrush,
} from './provenance/actions';
import { queryCompare } from './queries/queryCompare';
import { queryPrediction } from './queries/queryPrediction';
import { queryProjects } from './queries/queryProjects';
import RootStore from './RootStore';
import { DataPoint } from './types/Dataset';
import { initState, NodeStatus, ReapplyProvenance } from './types/Provenance';
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
import WorkflowStore from './WorkflowStore';

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

export type CompareData = {
  data: DataPoint[];
  compare: {
    [node: string]: {
      changes: {
        added: string[];
        removed: string[];
        updated: string[];
        updateMap: { source: string; target: string; id: string }[];
        results: string[];
      };
      state: ViewState;
    };
  };
};

const defaultCompareData: CompareData = {
  data: [],
  compare: {},
};

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
  provenance: ReapplyProvenance;
  workflow: WorkflowStore<typeof this.provenance.graph> | null = null;
  compareMode = false;
  compareTarget: string | null = null;
  compareData: CompareData = defaultCompareData;
  hoveredPrediction: Prediction | null = null;
  import = false;
  showGlobalScale = false;

  // Vis state
  record: StateRecord = {};
  lastAccessed = '';

  constructor(root: RootStore) {
    this.root = root;

    this.provenance = initProvenance(initState);
    this.provenance.done();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).printProvenanceTable = (keysToShow: string[] = ['id', 'label']) => {
      // eslint-disable-next-line no-console
      console.table(Object.values(toJS(this.provenance.graph.nodes)), keysToShow);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).printProvenance = () => {
      // eslint-disable-next-line no-console
      console.log(this.provenance.state);
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).printRawProvenance = () => {
      // eslint-disable-next-line no-console
      console.log(toJS(this.provenance.graph));
    };

    makeAutoObservable(this, {
      // getState: action,
      updateRecord: action,
      stateHelper: action,
      refreshPrediction: action,
      toggleShowCategories: action,
      setCompareTarget: action,
      switchBrush: action,
      toggleLabelLayer: action,
      switchCompareMode: action,
      toggleHideAggregateMembers: action,
      setHoveredPrediction: action,
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
      () => toJS(this.provenance.graph),
      (graph) => {
        if (this.workflow) this.workflow.updateGraph(graph);
      },
    );

    reaction(
      () => ({
        dataset_id: this.dataset_id,
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

    reaction(
      () => ({
        mode: this.compareMode,
        target: this.compareTarget,
      }),
      ({ mode, target }) => {
        if (!mode || !target || !this.dataset_id) return;
        this.getCompareData(this.dataset_id, target);
      },
    );

    reaction(
      () => Object.values(this.provenance.graph.nodes).length,
      () => {
        if (this.import) return;

        const { current } = this.provenance;

        if (isChildNode(current)) {
          const artifact: NodeStatus = {
            original_record: this.dataset_id || '',
            status: {},
          };

          this.root.projectStore.project?.datasets.forEach((dataset) => {
            if (dataset.id === this.dataset_id) {
              artifact.status[dataset.id] = 'Accepted';
            } else {
              artifact.status[dataset.id] = 'Unknown';
            }
          });

          this.provenance.addArtifact(artifact);
        }
      },
    );
  }

  // Getters
  get query() {
    return this.root.query;
  }

  get dataset_id() {
    return this.root.projectStore.dataset_id;
  }

  get base_dataset_id() {
    return this.dataset_id;
  }

  get data() {
    return this.root.projectStore.data;
  }

  get rawDataPoints() {
    return this.data?.values || [];
  }

  get nodeCreationMap() {
    const originMap: OriginMap = {};

    Object.values(this.provenance.graph.nodes).forEach((node) => {
      const art = this.provenance.getLatestArtifact(node.id);

      if (!art) return;

      const { artifact } = art;

      const datasetKey = this.root.projectStore.datasetVersionFromKey(artifact.original_record);
      const source: Source = {
        createdIn: datasetKey,
        approvedIn: Object.entries(artifact.status)
          .filter((v) => v[1] === 'Accepted')
          .map((v) => this.root.projectStore.datasetVersionFromKey(v[0])),
        rejectedIn: Object.entries(artifact.status)
          .filter((v) => v[1] === 'Rejected')
          .map((v) => this.root.projectStore.datasetVersionFromKey(v[0])),
      };
      originMap[node.id] = source;
    });

    return originMap;
  }

  get rangeMap() {
    const datas = Object.values(this.root.projectStore._data);

    const m: { [k: string]: { min: number; max: number } } = {};

    if (this.showGlobalScale) {
      datas.forEach((data) => {
        const { columnInfo, values = [] } = data;

        Object.keys(columnInfo).forEach((col) => {
          const [min = -1, max = -1] = extent(values.map((v) => v[col]) as number[]);

          if (!m[col]) {
            m[col] = { min, max };
          } else {
            m[col].min = m[col].min < min ? m[col].min : min;
            m[col].max = m[col].max > max ? m[col].max : max;
          }
        });
      });
    } else {
      if (!this.data) return m;
      const values = this.dataPoints;
      const { columnInfo } = this.data;

      Object.keys(columnInfo).forEach((col) => {
        const [min = -1, max = -1] = extent(values.map((v) => v[col]) as number[]);

        if (!m[col]) {
          m[col] = { min, max };
        } else {
          m[col].min = m[col].min < min ? m[col].min : min;
          m[col].max = m[col].max > max ? m[col].max : max;
        }
      });
    }

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
          if (!data[id]) return;

          if (!data[id][CUSTOM_LABEL]) data[id][CUSTOM_LABEL] = [label];
          else data[id][CUSTOM_LABEL].push(label);
        });
      });

      Object.entries(state.categoryAssignments).forEach(([category, assignments]) => {
        if (category !== this.selectedCategoryColumn) return;
        Object.entries(assignments).forEach(([label, values]) => {
          values.forEach((id) => {
            data[id][CUSTOM_CATEGORY_ASSIGNMENT] = label;
          });
        });
      });
    }

    return Object.values(data);
  }

  get doesHaveCategories() {
    if (!this.data) return false;

    return this.data.categoricalColumns.length > 0;
  }

  get changes() {
    const id = this.provenance.graph.current;
    const compareRecord = this.compareData.compare[id];

    if (!compareRecord)
      return {
        added: [],
        removed: [],
        updated: [],
        updateMap: [],
        results: [],
      };

    return compareRecord.changes;
  }

  get state() {
    const id = this.provenance.graph.current;
    let record = this.record[id];
    const compareRecord = this.compareData.compare[id];

    if (this.compareMode) {
      if (!compareRecord) {
        record = compareRecord;
      } else {
        record = compareRecord.state;
      }
    }

    return this.stateHelper(id, record);
  }

  get selections() {
    return this.state.selections;
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

  addPCP = (dimensions: string[] = []) => {
    if (!this.data) return;

    if (dimensions.length === 0) {
      const spec: PCPSpec = {
        i_type: 'ViewSpec',
        id: getPlotId(),
        type: 'PCP',
        action: 'Create',
        dimensions: this.data.numericColumns.slice(0, 4),
      };

      this.provenance.apply(addPCP(spec), 'Adding PCP');
    } else {
      const spec: PCPSpec = {
        i_type: 'ViewSpec',
        id: getPlotId(),
        type: 'PCP',
        action: 'Create',
        dimensions,
      };

      this.provenance.apply(addPCP(spec), 'Adding PCP');
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

  handleCategorization = (category: string, value: string) => {
    this.provenance.apply(
      assignCategory({
        i_type: 'Categorize',
        in: category,
        as: value,
      }),
    );
  };

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
  switchCompareMode = (enable: boolean) => {
    this.compareMode = enable;
  };

  setCompareTarget = (id: string) => {
    this.compareTarget = id;
  };

  setHoveredPrediction = (pred: Prediction | null) => {
    this.hoveredPrediction = pred;
  };

  loadWorkflow = async (id: string) => {
    const workflowExists = await checkIfWorkflowExists(id);

    if (!workflowExists) {
      const project = this.root.projectStore.project;
      runInAction(() => {
        if (project) {
          this.workflow = new WorkflowStore(
            id,
            project.id,
            project.name,
            toJS(this.provenance.graph),
            null,
            [],
            'Default',
          );
          this.workflow.sync();
        }
      });
    } else {
      runInAction(() => {
        this.import = true;
      });

      const projects = await this.query.fetchQuery('projects', () => queryProjects());

      if (projects.length === 0) return;

      const wf = await loadWorkflowFromFirebase(id);
      const { id: wf_Id, project, project_name, graph, order, name, type } = wf;

      this.root.projectStore.setProjects(projects);
      this.root.projectStore.setCurrentProject(project);

      if (!this.root.projectStore.project) return;
      await this.root.projectStore.getData(this.root.projectStore.project);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Object.entries(graph.nodes).forEach(([id, node]: [any, any]) => {
        const children = node.children;

        if (!children) node.children = [];
        graph.nodes[id] = node;
      });

      this.provenance.importProvenanceGraph(graph);
      this.root.projectStore.setDatasetId(this.root.projectStore.projects[project].datasets[0].id);

      this.updateRecord(this.dataset_id || '', this.provenance.graph);
      this.refreshPrediction();
      runInAction(() => {
        this.workflow = new WorkflowStore(wf_Id, project, project_name, graph, name, order, type);
      });

      runInAction(() => {
        this.import = false;
      });
    }
  };

  refreshPrediction = (_state?: ViewState) => {
    const state = _state ? _state : this.state;
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
      .fetchQuery(
        ['predictions', this.dataset_id, selections, dimensions, dataValues],
        () => queryPrediction(dataValues, dimensions, selections),
        { retry: 100 },
      )
      .then((pred) => {
        runInAction(() => {
          this.predictions = { isLoading: false, values: pred };
        });
      });
  };

  approveNode = (nodeId: string) => {
    let { artifact = null } = this.provenance.getLatestArtifact(nodeId) || {};

    artifact = JSON.parse(JSON.stringify(artifact));

    if (artifact) {
      artifact.status[this.dataset_id || ''] = 'Accepted';
      this.provenance.addArtifact(artifact, nodeId);
    }
  };

  rejectNode = (nodeId: string) => {
    let { artifact = null } = this.provenance.getLatestArtifact(nodeId) || {};

    artifact = JSON.parse(JSON.stringify(artifact));

    if (artifact) {
      artifact.status[this.dataset_id || ''] = 'Rejected';
      this.provenance.addArtifact(artifact, nodeId);
    }
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

  getCompareData = (base: string, target: string) => {
    const graph = this.provenance.graph;
    this.query
      .fetchQuery(['compare', this.dataset_id, this.compareTarget, graph], () =>
        queryCompare(
          this.root.projectStore._data[base].values,
          this.root.projectStore._data[target].values,
          graph,
        ),
      )
      .then((data) => {
        runInAction(() => {
          this.compareData = data;
        });
      });
  };

  setShowGlobalScale = (val: boolean) => {
    this.showGlobalScale = val;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateRecord = (dataset_id: string, graph: any) => {
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
