/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Chip,
  createStyles,
  FormControlLabel,
  IconButton,
  makeStyles,
  Paper,
  Switch,
  Theme,
  useTheme,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import AspectRatioIcon from '@material-ui/icons/AspectRatio';
import CloseIcon from '@material-ui/icons/Close';
import { SpeedDial, SpeedDialAction, SpeedDialIcon } from '@material-ui/lab';
import { symbol, symbolCross, symbolTriangle } from 'd3';
import { observer } from 'mobx-react';
import { useCallback, useContext, useState } from 'react';

import { GlobalPlotAttributeContext } from '../contexts/CategoryContext';
import { CUSTOM_CATEGORY_ASSIGNMENT } from '../stores/ExploreStore';
import { useStore } from '../stores/RootStore';
import translate from '../utils/transform';

import AddScatterplotDialog from './AddScatterplotDialog';
import PCP from './PCP/PCP';
import { createComet } from './Scatterplot/CompareMarks';
import Scatterplot, { ScatterplotPoint } from './Scatterplot/Scatterplot';
import useScatterplotStyle from './Scatterplot/styles';
import Symbol from './SidePanel/Symbol';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: () => ({
      width: '100%',
      height: '100%',
      display: 'grid',
      overflow: 'hidden',
      gridTemplateRows: 'min-content min-content auto',
      gridTemplateAreas: "'version' 'compare' 'vis'",
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
    compare: {
      gridArea: 'compare',
      display: 'flex',
      justifyContent: 'center',
      flexDirection: 'row',
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
    projectStore: { project, dataset_id, setDatasetId },
    exploreStore: {
      state: { scatterplots, freeformSelections, pcps },
      selectPointsFreeform,
      compareTarget,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      changes: { updated, added, removed },
      setCompareTarget,
      brushType,
      compareData,
      showGlobalScale,
      setShowGlobalScale,
      dataPoints,
      aggregateDataPoints,
      unselectPointsFreeform,
      setHighlightMode,
      setHighlightPredicate,
      compareMode,
      switchCompareMode,
      removeScatterplot,
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

  const [showDialog, setShowDialog] = useState(false);
  const spStyles = useScatterplotStyle();

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

  if (!data) return <div>Loading</div>;

  const pcp = pcps.map((view) => {
    return (
      <div key={view.id} className={styles.paperContainer}>
        <Paper className={styles.paper}>
          <PCP size={spContainerDimension - 2 * theme.spacing(1)} view={view} />
        </Paper>
      </div>
    );
  });

  const sps = scatterplots.map((view) => {
    const { x, y } = view;

    let points: ScatterplotPoint[] = [];
    let aggregatePoints: ScatterplotPoint[] = [];

    if (data) {
      const dps = compareMode ? compareData.data : dataPoints;
      const aggDps = compareMode ? [] : aggregateDataPoints;

      aggregatePoints = aggDps.map((d) => {
        let selectedCategory =
          showCategory && selectedCategoryColumn ? (d[selectedCategoryColumn] as string) : '-';

        if (d[CUSTOM_CATEGORY_ASSIGNMENT]) {
          selectedCategory = d[CUSTOM_CATEGORY_ASSIGNMENT];
        }

        return {
          x: d[x] as number,
          y: d[y] as number,
          label: d[data.labelColumn] as string,
          category: selectedCategory,
          ...d,
        };
      });

      points = dps.map((d) => {
        let selectedCategory =
          showCategory && selectedCategoryColumn ? (d[selectedCategoryColumn] as string) : '-';

        if (d[CUSTOM_CATEGORY_ASSIGNMENT]) {
          selectedCategory = d[CUSTOM_CATEGORY_ASSIGNMENT];
        }

        return {
          x: d[x] as number,
          y: d[y] as number,
          label: d[data.labelColumn] as string,
          category: selectedCategory,
          ...d,
        };
      });
    }

    const x_range = rangeMap[x];
    const y_range = rangeMap[y];

    return (
      <div key={view.id} className={styles.paperContainer}>
        <Paper className={styles.paper} elevation={3}>
          {n_plots > 1 && (
            <IconButton className={styles.closeIcon} onClick={() => removeScatterplot(view.id)}>
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
            selections={freeformSelections}
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
              color={
                dataset_id === d.id
                  ? 'primary'
                  : compareMode && compareTarget === d.id
                  ? 'secondary'
                  : 'default'
              }
              disabled={compareMode && d.id === dataset_id}
              label={d.version}
              onClick={() => {
                if (compareMode) {
                  setCompareTarget(d.id);
                } else {
                  setDatasetId(d.id);
                }
              }}
            />
          ))}
          <FormControlLabel
            control={<Switch onChange={() => switchCompareMode(!compareMode)} />}
            label="Compare"
          />
        </div>
        <div className={styles.compare}>
          {compareMode && (
            <>
              <Symbol
                label="Added"
                path={symbol().type(symbolTriangle).size(100)() || ''}
                onMouseEnter={() => {
                  setHighlightMode(true);
                  setHighlightPredicate((point) => {
                    return added.includes(point.id);
                  });
                }}
                onMouseLeave={() => {
                  setHighlightMode(false);
                  setHighlightPredicate(null);
                }}
              />
              <Symbol
                label="Removed"
                path={symbol().type(symbolCross).size(100)() || ''}
                transform="rotate(45)"
                onMouseEnter={() => {
                  setHighlightMode(true);
                  setHighlightPredicate((point) => {
                    return removed.includes(point.id);
                  });
                }}
                onMouseLeave={() => {
                  setHighlightMode(false);
                  setHighlightPredicate(null);
                }}
              />
              <Symbol
                label="Updated"
                shape={
                  <g transform={translate(5, 10)}>
                    <path
                      className={spStyles.movedLine}
                      d={createComet(0, 15, 0, 0)}
                      // fill="gray"
                      // opacity="0.8"
                    />
                    <circle className={spStyles.movedPoint} r="4" />
                    <circle className={spStyles.movedPoint} r="4" transform={translate(15, 0)} />
                  </g>
                }
                width="40"
                onMouseEnter={() => {
                  setHighlightMode(true);
                  setHighlightPredicate((point) => {
                    return updated.includes(point.id);
                  });
                }}
                onMouseLeave={() => {
                  setHighlightMode(false);
                  setHighlightPredicate(null);
                }}
              />
            </>
          )}
        </div>
        <div className={styles.visContainer}>
          <div className={styles.vis}>
            {pcp}
            {sps}
          </div>
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
          onClick={() => setShowDialog(true)}
        />
        <SpeedDialAction
          icon={<AspectRatioIcon />}
          tooltipPlacement="right"
          tooltipTitle={showGlobalScale ? 'Fit' : 'Global'}
          tooltipOpen
          onClick={() => setShowGlobalScale(!showGlobalScale)}
        />
      </SpeedDial>
      <AddScatterplotDialog show={showDialog} onClose={() => setShowDialog(false)} />
    </>
  );
};

export default observer(Visualization);
