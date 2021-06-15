import { makeAutoObservable } from 'mobx';

import RootStore from './RootStore';
import { Project } from './types/Project';

export default class ProjectStore {
  root: RootStore;
  project: Project | null = null;

  constructor(root: RootStore) {
    this.root = root;
    makeAutoObservable(this);
  }

  setCurrentProject = (project: Project) => {
    this.project = project;
  };
}
