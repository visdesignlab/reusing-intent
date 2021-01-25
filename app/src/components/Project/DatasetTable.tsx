import { ColDef, XGrid, ValueFormatterParams, CellClassParams } from '@material-ui/x-grid';
import React, { useContext, useMemo, useRef } from 'react';

import { Dataset } from '../../Store/Dataset';
import Store from '../../Store/Store';

 import HeaderDistribution from './HeaderDistribution';

function useDataGridFormat(data: Dataset | null, comparisonDataset: Dataset | null, headerHeight = 56, firstTable: boolean) {
  const { rows = [], columns = [] } = useMemo(() => {
    if (!data) return { rows: [], columns: [] };
    // console.log(toJS(data));
    const { columnInfo, columns, values } = data;

    const cols: ColDef[] = columns.map((col) => ({
      field: col,
      headerName: columnInfo[col].fullname,
      description: columnInfo[col].unit || '',
      flex: 1,
      renderHeader: (params) => {
        const { width } = params.colDef;

        if (headerHeight) return <div>{params.field}</div>;

        return (
          <div>
            <HeaderDistribution column={columnInfo[col]} height={headerHeight} width={width} />
          </div>
        );
      },

      renderCell: (params: ValueFormatterParams) => {
        console.log(params);

        if (comparisonDataset === null)
        {
          return <div>{params.value}</div>;
        }

        const label = params.row.Label

        console.log(JSON.parse(JSON.stringify(comparisonDataset)));
        console.log(JSON.parse(JSON.stringify(params.row)));

        const row = comparisonDataset.values.filter((d) => d.Label === label);


        let color = 'none'

        if(row.length === 0)
        {
          color = firstTable ? '#ff8080' : '#90EE90';
        }
        else if (!firstTable)
        {
          const valueChange = params.getValue(params.field) !== row[0][params.field];

          // console.log(params.getValue(params.field));
          // console.log(row[0][params.field]);

          if(valueChange) color = '#ffff8b';
        }


        return (
          <div style={{padding: 0, width: '100%', background: color }}>
            {params.value}
          </div>
        );

      },
      cellClassName: (params: CellClassParams) => {
        if (comparisonDataset === null) return 'none';
        const label = params.row.Label;

        console.log(JSON.parse(JSON.stringify(comparisonDataset)));
        console.log(JSON.parse(JSON.stringify(params.row)));

        const row = comparisonDataset.values.filter((d) => d.Label === label);

        let color = 'none';

        if (row.length === 0) {
          color = firstTable ? 'red' : 'green';
        } else if (!firstTable) {
          const valueChange = params.getValue(params.field) !== row[0][params.field];

          // console.log(params.getValue(params.field));
          // console.log(row[0][params.field]);

          if (valueChange) color = 'yellow';
        }

        return color;
      }
    }));

    return { rows: values as any, columns: cols };
  }, [data, comparisonDataset, headerHeight, firstTable]);

  return { rows, columns };
}

type paramType = {
  columnNum:number;
}

export const DatasetTable = (p:paramType) => {
  const ref = useRef<HTMLDivElement>(null);
  const headerHeight = 56;
  const { loadedDataset, comparisonDataset } = useContext(Store).projectStore;
  const { rows, columns } = useDataGridFormat(loadedDataset, comparisonDataset, headerHeight, true);

  return (
    <div style={{gridColumnStart: 1, gridColumnEnd: 1 + p.columnNum}}>
      <XGrid
        ref={ref}
        columns={columns}
        headerHeight={headerHeight}
        rows={rows}
        autoPageSize
        pagination
      />
    </div>
  );
};

export const ComparisonTable = () => {
  const ref = useRef<HTMLDivElement>(null);
  const headerHeight = 56;
  const { loadedDataset, comparisonDataset } = useContext(Store).projectStore;
  const { rows, columns } = useDataGridFormat(comparisonDataset, loadedDataset, headerHeight, false);

  return (
    <div style={{gridColumnStart: 2, gridColumnEnd: 3}}>
      <XGrid
        ref={ref}
        columns={columns}
        headerHeight={headerHeight}
        rows={rows}
        autoPageSize
        pagination
      />
    </div>
  );
};
