import { isChildNode } from '@visdesignlab/trrack';
import Axios, { AxiosResponse } from 'axios';
import { action, makeAutoObservable, reaction } from 'mobx';

import { SERVER } from '../consts';
import { OriginMap } from '../trrack-vis/Utils/BundleMap';

import { ExploreStore } from './ExploreStore';
import { RootStore } from './Store';
import { Dataset } from './Types/Dataset';
import { Project, ProjectList, UploadedDatasetList } from './Types/Project';

export class ProjectStore {
  rootStore: RootStore;
  currentProject: Project | null = null;
  projects: ProjectList = [];
  comparisonDatasetKey: string | null = null;
  loadedDataset: Dataset | null = null;
  workingDataset: Dataset | null = null;
  comparisonDataset: Dataset | null = null;
  currentDatasetKey: string | null = null;

  isReapplying = false;
  nodeCreationMap: OriginMap;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.nodeCreationMap = {};
    makeAutoObservable(this);
    this.loadProjects();

    reaction(
      () => this.currentDatasetKey,
      () => this.fetchCurrentDataset(),
    );
  }

  // ##################################################################### //
  // ############################## Getters ############################## //
  // ##################################################################### //

  get provenance() {
    return this.rootStore.provenance;
  }

  get loadedDatasetKey() {
    return this.currentDatasetKey || '';
  }

  get compDatasetValues() {
    return (
      this.comparisonDataset?.values.filter(
        (d) => !this.rootStore.compareStore.updatedFilterPoints.includes(d.id),
      ) || []
    );
  }

  // ##################################################################### //
  // ########################### Store Helpers ########################### //
  // ##################################################################### //

  projectByKey = (key: string) => {
    const proj = this.projects.find((p) => p.key === key);

    return proj;
  };

  fetchCurrentDataset = () => {
    if (!this.currentProject || !this.currentDatasetKey) return;

    Axios.get(`${SERVER}/${this.currentProject.key}/dataset/${this.currentDatasetKey}`).then(
      action((response: AxiosResponse<Dataset>) => {
        this.loadedDataset = response.data;
        this.workingDataset = response.data;
      }),
    );
  };

  addToCreationMap = (node: string) => {
    console.log('creaiton map added to');
    this.nodeCreationMap[node] = {
      createdIn: this.loadedDataset!.version,
      approvedIn: [this.loadedDataset!.version],
    };
  };
  addToApproved = (node: string) => {
    this.nodeCreationMap[node].approvedIn.push(this.loadedDataset!.version);
  };

  // ##################################################################### //
  // ########################### Store Actions ########################### //
  // ##################################################################### //

  loadProjects = (newProjectId: string | null = null) => {
    Axios.get(`${SERVER}/project`).then(
      action((response: AxiosResponse<ProjectList>) => {
        this.projects = response.data;

        if (!newProjectId && this.rootStore.debug) {
          this.loadProjectByKey(this.rootStore.defaultProject);
        } else if (newProjectId) {
          const proj = this.projects.find((p) => p.key === newProjectId);

          if (proj) {
            this.loadProjectByKey(proj.key);
          }
        }
      }),
    );
  };

  loadProjectByKey = (projectId: string) => {
    const proj = this.projectByKey(projectId);

    if (!proj) return;

    this.loadedDataset = null;
    this.rootStore.exploreStore = new ExploreStore(this.rootStore);

    Axios.get(`${SERVER}/${projectId}/dataset`).then(
      action((response: AxiosResponse<UploadedDatasetList>) => {
        this.currentProject = { ...proj, datasets: response.data };

        if (this.rootStore.debug && this.rootStore.loadDefaultDataset) {
          const datasetKey = this.rootStore.defaultDatasetKey;

          if (datasetKey && this.currentProject.datasets.map((d) => d.key).includes(datasetKey))
            this.loadDataset(datasetKey);
          else this.loadDataset(this.currentProject.datasets[0].key);
        }
      }),
    );
  };

  loadComparisonDataset = (datasetKey: string) => {
    if (!this.currentProject) return;

    Axios.get(`${SERVER}/${this.currentProject.key}/dataset/${datasetKey}`).then(
      action((response: AxiosResponse<Dataset>) => {
        this.comparisonDatasetKey = datasetKey;
        this.comparisonDataset = response.data;
      }),
    );
  };

  // loadComparisonApply = (datasetKey: string) => {
  //   if (!this.currentProject) return;

  //   this.comparisonDatasetKey = datasetKey;

  //   Axios.get(`${SERVER}/${this.currentProject.key}/dataset/${datasetKey}`).then(
  //     action((response: AxiosResponse<Dataset>) => {
  //       this.comparisonDataset = response.data;
  //     }),
  //   );

  //   Axios.post(`${SERVER}/project/${this.currentProject.key}/apply`, {
  //     baseDataset: this.loadedDatasetKey,
  //     updatedDataset: datasetKey,
  //     interactions: this.rootStore.exploreStore.interactions || [],
  //   }).then(
  //     action((response: AxiosResponse<unknown>) => {
  //       this.rootStore.compareStore.updatedActions = response.data;
  //     }),
  //   );
  // };

  //load the dataset into comparison
  loadComparisonFilter = (selectedIds: string[]): string[] => {
    const removeIds = this.workingDataset?.values.filter((d) => {
      return selectedIds.includes(d.id);
    });

    const idList = [];

    if (this.workingDataset && removeIds) {
      this.workingDataset.values = removeIds;

      for (const j of removeIds) {
        idList.push(j.id);
      }
    }

    return idList;
  };

  loadOnlyFilter = (selectedIds: string[]): string[] => {
    const removeIds =
      this.workingDataset?.values.filter((d) => {
        return !selectedIds.includes(d.id);
      }) || [];

    const idList = [];

    if (this.workingDataset && removeIds) {
      this.workingDataset.values = removeIds;

      for (const j of removeIds) {
        idList.push(j.id);
      }
    }

    return idList;
  };

  // ##################################################################### //
  // ######################### Provenance Actions ######################## //
  // ##################################################################### //

  loadDataset = (datasetKey: string) => {
    this.currentDatasetKey = datasetKey;
  };

  loadDatasetWithReapply = (datasetKey: string) => {
    if (!this.currentProject || !this.currentDatasetKey) return;
    this.isReapplying = true;

    const graph = this.provenance.graph;

    Object.entries(graph.nodes).forEach((ent) => {
      const [key, val] = ent;

      if (isChildNode(val)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (val as any).state = this.provenance.getState(val);
      }

      graph.nodes[key] = val;
    });

    Axios.post(`${SERVER}/project/${this.currentProject.key}/reapply`, {
      base: this.currentDatasetKey,
      target: datasetKey,
      provenance: graph,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    }).then(
      action((res) => {
        // this.provenance.importProvenanceGraph(res.data.graph);
        this.currentDatasetKey = datasetKey;
        this.rootStore.exploreStore.stateRecord = res.data;
        setTimeout(
          action(() => (this.isReapplying = false)),
          200,
        );
      }),
    );
  };
}
