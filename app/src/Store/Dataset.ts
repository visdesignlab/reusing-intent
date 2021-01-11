export type BaseColumn = {
  fullname: string;
  short: string;
  unit: string | null;
};

export type NumericDistribution = {
  '25%': number;
  '50%': number;
  '75%': number;
  count: number;
  max: number;
  mean: number;
  min: number;
  std: number;
};

export type NumericColumn = BaseColumn & {
  dataType: 'numeric';
  info: NumericDistribution;
};

export type CategoricalDistribution = { [key: string]: number };

export type CategoricalColumn = BaseColumn & {
  dataType: 'categorical';
  info: CategoricalDistribution;
};

export type LabelColumn = BaseColumn & {
  dataType: 'label';
  info: null;
};

export type IdColumn = BaseColumn & {
  dataType: 'id';
  info: null;
};

export type Column = NumericColumn | CategoricalColumn | LabelColumn | IdColumn;

export type Columns = { [key: string]: Column };
export type ColumnInfo = { [key: string]: Column };

export type DatasetColumn = string;

export type DataPoint = { [key in DatasetColumn]: string | number };

// export type Dataset = {
//   columns: Columns;
//   values: DataPoint[];
//   categoricalColumns: string[];
//   numericColumns: string[];
//   labelColumn: string;
//   allColumns: string[];
// };

export type Dataset = {
  columns: string[];
  categoricalColumns: string[];
  numericColumns: string[];
  labelColumn: string;
  values: DataPoint[];
  columnInfo: ColumnInfo;
};
