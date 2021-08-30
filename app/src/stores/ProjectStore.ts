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
  _data: { [id: string]: Data } = {};
  projects: Projects = [];

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);
    reaction(
      () => this.project,
      (project) => {
        if (project) this.getData(project);
      },
    );
  }

  get data() {
    if (!this.dataset_id) return null;

    return this._data[this.dataset_id];
  }

  get query() {
    return this.root.query;
  }

  setCurrentProject = (project: Project) => {
    localStorage.removeItem('aggOpt');

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
          if (!this.dataset_id) return;
          this._data[this.dataset_id] = { ...this.data, ...addCategoryColumn };

          this.root.exploreStore.selectedCategoryColumn = columnName;
        }
      });
    }
  };

  getData = (project: Project) => {
    const { datasets } = project;

    const dataset_requests: Promise<Data>[] = [];

    datasets.forEach((dataset) => {
      const data = this.query.fetchQuery(['dataset', dataset.id], () => queryData(dataset.id));
      dataset_requests.push(data);
    });

    Promise.all(dataset_requests)
      .then((datasets) => {
        const datas: { [r: string]: Data } = {};
        datasets.forEach((data) => {
          datas[data.id] = data;
        });
        runInAction(() => {
          this._data = datas;
        });
      })
      .catch((err) => {
        throw new Error(err);
      });
  };
}
