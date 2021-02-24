import Axios, { AxiosResponse } from 'axios';
import { action, makeAutoObservable } from 'mobx';

import { SERVER } from '../consts';

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

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.loadProjects();
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

  get loadedDatasetKey() {
    return this.state.datasetKey;
  }

  get loadedDatasetValues() {

    return this.loadedDataset?.values.filter((d) => !this.rootStore.compareStore.updatedFilterPoints.includes(d.id)) || [];
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

  loadComparisonApply = (datasetKey: string) => {
    if (!this.currentProject) return;

    this.comparisonDatasetKey = datasetKey;

    Axios.get(`${SERVER}/${this.currentProject.key}/dataset/${datasetKey}`).then(
      action((response: AxiosResponse<Dataset>) => {
        this.comparisonDataset = response.data;
      }),
    );

    console.log(JSON.parse(JSON.stringify(this.rootStore.exploreStore.interactions)));

    Axios.post(`${SERVER}/project/${this.currentProject.key}/apply`, {
      baseDataset: this.loadedDatasetKey,
      updatedDataset: datasetKey,
      interactions: this.rootStore.exploreStore.interactions || [],
    }).then(
      action((response: AxiosResponse<unknown>) => {
        console.log(response.data);
        console.log(this.provenance.graph);
        this.rootStore.compareStore.updatedActions = response.data;
      }),
    );
  };

  //load the dataset into comparison
  loadComparisonFilter = (selectedIds: string[]): string[] => {
    const removeIds = this.workingDataset?.values.filter((d) => {
      return selectedIds.includes(d.id);
    });

    const idList = [];

    if (this.workingDataset && removeIds) {
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
    if (!this.currentProject) return;

    Axios.get(`${SERVER}/${this.currentProject.key}/dataset/${datasetKey}`).then(
      action((response: AxiosResponse<Dataset>) => {
        const { changeDatasetAction } = this.rootStore.actions;

        this.rootStore.bundledNodes.push(this.rootStore.currentNodes);
        this.rootStore.currentNodes = [];

        changeDatasetAction.setLabel(`Load ${datasetKey} dataset`);
        this.provenance.apply(changeDatasetAction(datasetKey));

        this.rootStore.currentNodes.push(this.provenance.graph.current);

        this.loadedDataset = response.data;
        this.workingDataset = response.data;
      }),
    );
  };
}
