import {
  Chip,
  createStyles,
  IconButton,
  makeStyles,
  Paper,
  Theme,
  useTheme,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@material-ui/lab';
import { observer } from 'mobx-react';
import { useCallback, useContext, useState } from 'react';

import { GlobalPlotAttributeContext } from '../contexts/CategoryContext';
import { useStore } from '../stores/RootStore';

import Scatterplot, { ScatterplotPoint } from './Scatterplot/Scatterplot';

// type StyleProps = { dimension: number; showCategories: boolean };

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: () => ({
      width: '100%',
      height: '100%',
      display: 'grid',
      overflow: 'hidden',
      gridTemplateRows: 'min-content auto',
      gridTemplateAreas: "'version' 'vis'",
    }),
    chips: {
      gridArea: 'version',
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      '& > *': {
        margin: theme.spacing(0.5),
      },
    },
    speedDial: {
      position: 'absolute',
      bottom: theme.spacing(2),
      left: theme.spacing(2),
    },
    vis: {
      gridArea: 'vis',
      display: 'flex',
      gap: theme.spacing(2),
      flexFlow: 'column',
      overlfow: 'auto',
      justifyContent: 'center',
      alignItems: 'center',
    },
    paperContainer: {
      height: 'min-content',
    },
    paper: () => ({
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignContent: 'center',
      padding: theme.spacing(1),
    }),
    visContainer: { overflow: 'auto', padding: '1em' },
    closeIcon: {
      position: 'absolute',
      left: 0,
      top: 0,
    },
    sidePanel: {
      gridArea: 'side',
      minWidth: '200px',
    },
  }),
);

const Visualization = () => {
  const [open, setOpen] = useState(false);
  const {
    projectStore: { project, dataset_id },
    exploreStore: {
      state: { scatterplots },
      addScatterplot,
      selectPointsFreeform,
      brushType,
      dataPoints,
      aggregate,
      unselectPointsFreeform,
      handleBrushSelection,
      data,
      rangeMap,
    },
  } = useStore();
  const theme = useTheme();

  const n_plots = scatterplots.length + 1;

  const spContainerDimension = 500;

  const { showCategory = false, selectedCategoryColumn = null, categoryMap = {} } =
    useContext(GlobalPlotAttributeContext) || {};

  const styles = useStyles({ dimension: spContainerDimension, showCategory });

  const labelMaker = useCallback(
    (col_name: string) => {
      if (!data) return '';
      const { columnInfo } = data;

      const column = columnInfo[col_name];

      return (
        <>
          <tspan fontWeight="bold">{column.short}</tspan> <tspan>|</tspan>{' '}
          <tspan>{column.fullname}</tspan>{' '}
          {column.unit && <tspan fontStyle="italic">({column.unit})</tspan>}
        </>
      );
    },
    [data],
  );

  if (!project) return <div>Something went wrong!</div>;

  const sps = scatterplots.map((view) => {
    const { x, y } = view;

    let points: ScatterplotPoint[] = [];
    let aggregatePoints: ScatterplotPoint[] = [];

    if (data) {
      points = dataPoints.map((d) => ({
        x: d[x] as number,
        y: d[y] as number,
        label: d[data.labelColumn] as string,
        category:
          showCategory && selectedCategoryColumn ? (d[selectedCategoryColumn] as string) : '-',
        ...d,
      }));

      aggregatePoints = aggregate.map((d) => ({
        x: d[x] as number,
        y: d[y] as number,
        label: d[data.labelColumn] as string,
        category:
          showCategory && selectedCategoryColumn ? (d[selectedCategoryColumn] as string) : '-',
        ...d,
      }));
    }

    const x_range = rangeMap[x];
    const y_range = rangeMap[y];

    return (
      <div key={view.id} className={styles.paperContainer}>
        <Paper className={styles.paper} elevation={3}>
          {n_plots > 1 && (
            <IconButton className={styles.closeIcon}>
              <CloseIcon />
            </IconButton>
          )}
          <Scatterplot
            _x_extents={[x_range.min, x_range.max]}
            _y_extents={[y_range.min, y_range.max]}
            aggregatePoints={aggregatePoints}
            brushType={brushType}
            categoryMap={categoryMap}
            freeformBrushHandler={(points, view, action) => {
              if (action === 'Selection') selectPointsFreeform(points, view);
              else unselectPointsFreeform(points, view);
            }}
            margin={60}
            points={points}
            rectangularBrushHandler={handleBrushSelection}
            selections={view.freeformSelections}
            showCategories={showCategory}
            size={spContainerDimension - 2 * theme.spacing(1)}
            view={view}
            xAxisLabel={labelMaker}
            yAxisLabel={labelMaker}
          />
        </Paper>
      </div>
    );
  });

  return (
    <>
      <div className={styles.root}>
        <div className={styles.chips}>
          {project.datasets.map((d) => (
            <Chip
              key={d.id}
              color={dataset_id === d.id ? 'primary' : 'default'}
              label={d.version}
            />
          ))}
        </div>
        <div className={styles.visContainer}>
          <div className={styles.vis}>{sps}</div>
        </div>
      </div>
      <SpeedDial
        ariaLabel="SpeedDial example"
        className={styles.speedDial}
        icon={<SpeedDialIcon />}
        open={open}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
      >
        <SpeedDialAction
          icon={<AddIcon />}
          tooltipPlacement="right"
          tooltipTitle="Add"
          tooltipOpen
          onClick={() => addScatterplot()}
        />
      </SpeedDial>
    </>
  );
};

export default observer(Visualization);
