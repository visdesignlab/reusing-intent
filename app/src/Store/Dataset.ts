export type Column = {
  dataType: 'numeric' | 'label' | 'categorical';
  fullname: string;
  short: string;
  unit: string | null;
};

export type Columns = { [key: string]: Column };

export type DatasetColumn = keyof Columns;

export type DataPoint = { [key in DatasetColumn]: string | number };

export type Dataset = {
  columns: Columns;
  values: DataPoint[];
};

export function getColumns(cols: Columns): string[] {
  return Object.keys(cols);
}
