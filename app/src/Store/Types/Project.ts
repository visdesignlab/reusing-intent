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
