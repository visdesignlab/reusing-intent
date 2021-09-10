import { createStyles, makeStyles } from '@material-ui/core';
import { DataGrid } from '@material-ui/data-grid';
import { observer } from 'mobx-react';
import { useMemo } from 'react';

import { useStore } from '../stores/RootStore';
import { Data } from '../stores/types/Dataset';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      height: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
  }),
);

function useDataGrid(data: Data | null, headerHeight = 56) {
  const { rows = [], columns = [] } = useMemo(() => {
    if (!data) return { rows: [], columns: [] };

    const { columnInfo, columns, values, labelColumn } = data;

    const organizedColumns = [labelColumn, ...columns.filter((c) => c !== labelColumn)];

    const cols = organizedColumns
      .filter((col) => !['id', 'iid'].includes(col))
      .map((col) => ({
        field: col,
        headerName: columnInfo[col].fullname,
        description: columnInfo[col].unit || '',
        flex: 1,
      }));

    return { rows: values, columns: cols };
  }, [data]);

  return { rows, columns, headerHeight };
}

const DataView = () => {
  const styles = useStyles();

  const headerHeight = 56;

  const {
    projectStore: { data },
  } = useStore();

  const { rows, columns } = useDataGrid(data, headerHeight);

  return (
    <div className={styles.root}>
      {rows.length > 0 && columns.length > 0 && (
        <DataGrid columns={columns} headerHeight={56} rows={rows} autoPageSize pagination />
      )}
    </div>
  );
};

export default observer(DataView);
