/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeStyles, Typography } from '@material-ui/core';
import { DataGrid } from '@material-ui/data-grid';
import { ValueFormatterParams } from '@material-ui/x-grid';
import { observer } from 'mobx-react';
import React, { useCallback, useContext, useMemo, useRef } from 'react';

import Store from '../../Store/Store';
import { Dataset } from '../../Store/Types/Dataset';

import HeaderDistribution from './HeaderDistribution';

function useDataGridFormat(
  data: Dataset | null,
  comparisonDataset: Dataset | null,
  headerHeight = 56,
  firstTable: boolean,
) {
  const st = useCallback((background) => {
    return {
      padding: 0,
      width: '100%',
      background,
    };
  }, []);

  const { rows = [], columns = [] } = useMemo(() => {
    if (!data) return { rows: [], columns: [] };
    // console.log(toJS(data));
    const { columnInfo, columns, values } = data;

    const cols: any[] = columns
      .filter((col) => col !== 'id' && col !== 'iid')
      .map((col) => ({
        field: col,
        headerName: columnInfo[col].fullname,
        description: columnInfo[col].unit || '',
        flex: 1,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        renderHeader: (params: any) => {
          const { width } = params.colDef;

          if (headerHeight) return <div>{params.field}</div>;

          return (
            <div>
              <HeaderDistribution column={columnInfo[col]} height={headerHeight} width={width} />
            </div>
          );
        },

        renderCell: (params: ValueFormatterParams) => {
          if (comparisonDataset === null) {
            return <div>{params.value}</div>;
          }

          const label = params.row.Label;

          const row = comparisonDataset.values.filter((d) => d.Label === label);

          let color = 'none';

          if (row.length === 0) {
            color = firstTable ? '#ff8080' : '#90EE90';
          } else if (!firstTable) {
            const valueChange = params.getValue(params.field) !== row[0][params.field];

            // console.log(params.getValue(params.field));
            // console.log(row[0][params.field]);

            if (valueChange) color = '#ffff8b';
          }

          return <div style={st(color)}>{params.value}</div>;
        },
        cellClassName: (params: any) => {
          if (comparisonDataset === null) return 'none';
          const label = params.row.Label;

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
        },
      }));

    return { rows: values, columns: cols };
  }, [data, comparisonDataset, headerHeight, firstTable, st]);

  return { rows, columns };
}

type paramType = {
  columnNum: number;
};

const useStyles = makeStyles(() => ({
  centerText: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
}));

export const DatasetTable = observer((p: paramType) => {
  const ref = useRef<HTMLDivElement>(null);
  const classes = useStyles();
  const headerHeight = 56;
  const { loadedDataset } = useContext(Store).projectStore;
  const { rows, columns } = useDataGridFormat(loadedDataset, null, headerHeight, true);

  return (
    <div
      className={classes.centerText}
      style={{ gridColumnStart: 1, gridColumnEnd: 1 + p.columnNum }}
    >
      {rows.length > 0 ? (
        <DataGrid
          ref={ref}
          columns={columns}
          headerHeight={headerHeight}
          rows={rows}
          autoPageSize
          pagination
        />
      ) : (
        <Typography variant="button">Please select a dataset</Typography>
      )}
    </div>
  );
});

export const ComparisonTable = observer(() => {
  const ref = useRef<HTMLDivElement>(null);
  const headerHeight = 56;
  const { currentComparisonDatasets } = useContext(Store).projectStore;
  const { rows, columns } = useDataGridFormat(
    currentComparisonDatasets[0],
    currentComparisonDatasets[1],
    headerHeight,
    false,
  );

  return (
    <div style={{ gridColumnStart: 2, gridColumnEnd: 3 }}>
      <DataGrid
        ref={ref}
        columns={columns}
        headerHeight={headerHeight}
        rows={rows}
        autoPageSize
        pagination
      />
    </div>
  );
});
