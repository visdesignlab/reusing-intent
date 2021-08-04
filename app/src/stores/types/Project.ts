import { ColumnInfo, Datasets } from './Dataset';

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
    id: string;
    columnInfo: ColumnInfo;
    numericColumns: string[];
    categoricalColumns: string[];
    labelColumn: string;
    columns: string[];
  };
};

export type Projects = Project[];

export type Project = {
  id: string;
  name: string;
  datasets: Datasets;
};
