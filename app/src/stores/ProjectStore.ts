import { makeAutoObservable, reaction, runInAction } from 'mobx';

import { addCategory } from './queries/mutateCategoryColumn';
import { queryData } from './queries/queryData';
import RootStore from './RootStore';
import { Data } from './types/Dataset';
import { Project, Projects } from './types/Project';

export default class ProjectStore {
  root: RootStore;
  project: Project | null = null;
  dataset_id: string | null = null;
  data: Data | null = null;
  projects: Projects = [];

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);
    reaction(
      () => this.dataset_id,
      (id) => this.getData(id),
    );
  }

  setCurrentProject = (project: Project) => {
    this.project = project;
  };

  setDatasetId = (id: string) => {
    this.dataset_id = id;
  };

  addCategoryColumn = async (columnName: string, options: string) => {
    if (!this.project) return;

    const { data: d } = await addCategory(this.project.id, columnName, options);

    if (d) {
      const { addCategoryColumn } = d;
      runInAction(() => {
        if (this.data) {
          this.data = { ...this.data, ...addCategoryColumn };
          this.root.exploreStore.selectedCategoryColumn = columnName;
        }
      });
    }
  };

  getData = async (record_id: string | null) => {
    if (!record_id) {
      runInAction(() => {
        this.data = null;
      });

      return;
    }

    const { data } = await queryData(record_id);
    runInAction(() => {
      this.data = data.data;
    });
  };
}
