import Axios, { AxiosResponse } from 'axios';
import { action, makeAutoObservable } from 'mobx';

import { SERVER } from '../consts';

import { Dataset } from './Dataset';
import { RootStore } from './Store';

export type UploadedDatasetList = {
  key: string;
  version: string;
  rows: number;
  columns: number;
  description: string;
}[];

export type Project = {
  key: string;
  name: string;
  datasets: UploadedDatasetList;
};

export type ProjectList = {
  key: string;
  name: string;
}[];

export class ProjectStore {
  rootStore: RootStore;
  currentProject: Project | null = null;
  projects: ProjectList = [];
  loadedDatasetKey: string | null = null;
  comparisonDatasetKey: string | null = null;
  loadedDataset: Dataset | null = null;
  comparisonDataset: Dataset | null = null;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    makeAutoObservable(this);
    this.loadProjects();
  }

  projectByKey = (key: string) => {
    const proj = this.projects.find((p) => p.key === key);

    return proj;
  };

  loadProjects = (newProjectId: string | null = null) => {
    Axios.get(`${SERVER}/project`).then(
      action((response: AxiosResponse<ProjectList>) => {
        this.projects = response.data;

        if (!newProjectId && this.rootStore.debug) {
          this.selectProject(this.rootStore.defaultProject);
        }

        if (newProjectId) {
          const proj = this.projects.find((p) => p.key === newProjectId);

          if (proj) {
            this.selectProject(proj.key);
          }
        }
      }),
    );
  };

  selectProject = (projectId: string) => {
    const proj = this.projectByKey(projectId);

    if (!proj) return;

    Axios.get(`${SERVER}/${projectId}/dataset`).then(
      action((response: AxiosResponse<UploadedDatasetList>) => {
        this.currentProject = { ...proj, datasets: response.data };

        if (this.rootStore.debug && response.data.length > 0) {
          this.loadDataset(response.data[0].key);
        }
      }),
    );
  };

  loadDataset = (datasetKey: string) => {
    if (!this.currentProject) return;

    Axios.get(`${SERVER}/${this.currentProject.key}/dataset/${datasetKey}`).then(
      action((response: AxiosResponse<Dataset>) => {
        this.rootStore.exploreStore.changeDataset(datasetKey);
        this.loadedDatasetKey = datasetKey;
        this.loadedDataset = response.data;
      }),
    );
  };

  loadComparisonDataset = (datasetKey: string) => {
    if (!this.currentProject) return;

    Axios.get(`${SERVER}/${this.currentProject.key}/dataset/${datasetKey}`).then(
      action((response: AxiosResponse<Dataset>) => {
        this.rootStore.exploreStore.changeDataset(datasetKey);
        this.comparisonDatasetKey = datasetKey;
        this.comparisonDataset = response.data;
      }),
    );
  };
}
