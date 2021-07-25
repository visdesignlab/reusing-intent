import { Datasets } from './Dataset';

export type ProjectResult = {
  projects: {
    success: boolean;
    errors: string[];
    projects: Projects;
  };
};

export type CategoryResult = {
  addCategoryColumn: {
    success: boolean;
    errors: string[];
  };
};

export type Projects = Project[];

export type Project = {
  id: string;
  name: string;
  datasets: Datasets;
};
