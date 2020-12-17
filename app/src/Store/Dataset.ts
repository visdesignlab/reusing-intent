export type Column = {
  dataType: 'numeric' | 'label' | 'categorical';
  fullname: string;
  short: string;
  unit: string | null;
};

export type Columns = { [key: string]: Column };

export type DatasetColumn = string;

export type DataPoint = { [key in DatasetColumn]: string | number };

export type Dataset = {
  columns: Columns;
  values: DataPoint[];
  categoricalColumns: string[];
  numericColumns: string[];
  labelColumn: string;
  allColumns: string[];
};
