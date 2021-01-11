import { ColDef, XGrid } from '@material-ui/x-grid';
import { observer } from 'mobx-react';
import React, { useContext, useMemo, useRef } from 'react';

import { Dataset } from '../../Store/Dataset';
import Store from '../../Store/Store';

import HeaderDistribution from './HeaderDistribution';

function useDataGridFormat(data: Dataset | null, headerHeight = 56) {
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

        return (
          <div>
            <HeaderDistribution column={columnInfo[col]} height={headerHeight} width={width} />
          </div>
        );
      },
    }));

    return { rows: values as any, columns: cols };
  }, [data, headerHeight]);

  return { rows, columns };
}

const DatasetTable = () => {
  const ref = useRef<HTMLDivElement>(null);
  const headerHeight = 100;
  const { loadedDataset } = useContext(Store).projectStore;
  const { rows, columns } = useDataGridFormat(loadedDataset, headerHeight);

  return (
    <div>
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

export default observer(DatasetTable);
