export type Datasets = Dataset[];

export type Dataset = {
  id: string;
  version: string;
  project_id: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataPoint = { id: string; iid: string; [key: string]: string | number | any };

type BaseColumn = {
  fullname: string;
  short: string;
  unit: string | null;
  options?: string[];
};

type NumericColumn = BaseColumn & {
  data_type: 'numeric';
};

type CategoricalColumn = BaseColumn & {
  data_type: 'categorical';
};

type LabelColumn = BaseColumn & {
  data_type: 'label';
};

type IdColumn = BaseColumn & {
  data_type: 'id';
};

type IidColumn = BaseColumn & {
  data_type: 'iid';
};

type Column = NumericColumn | CategoricalColumn | LabelColumn | IdColumn | IidColumn;

export type ColumnInfo = { [key: string]: Column };

export type Data = {
  success: boolean;
  errors: string[];
  id: string;
  version: string;
  columnInfo: ColumnInfo;
  numericColumns: string[];
  categoricalColumns: string[];
  labelColumn: string;
  columns: string[];
  values: DataPoint[];
};

export type DataResult = {
  data: Data;
};
