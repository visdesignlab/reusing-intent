import {
  Chip,
  CircularProgress,
  createStyles,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Theme,
  useTheme,
  Switch,
  FormControlLabel,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { observer } from 'mobx-react';
import React, { FC, useContext, useState } from 'react';
import { toJS } from 'mobx';

import Store from '../Store/Store';

import Scatterplot from './Scatterplot/Scatterplot';
import { DataDisplay } from './Comparison/ComparisonScatterplot';
import ComparisonLegend from './Comparison/ComparisonLegend';
import LabelLegend from './Label/LabelLegend';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: theme.spacing(2),
      overflow: 'auto',
    },
    chips: {
      display: 'flex',
      justifyContent: 'center',
      flexWrap: 'wrap',
      '& > *': {
        margin: theme.spacing(0.5),
      },
    },
    grid: {
      height: '100%',
    },
    closeIcon: {
      position: 'absolute',
    },
  }),
);

const Visualization: FC = () => {
  const {
    exploreStore: { plots, removePlot, isLoadingData, n_plots, isComparison, setComparison, selectedPoints},
    projectStore: { currentProject, currentDatasetKey, loadDatasetWithReapply, loadComparisonDataset, isReapplying, currentComparisonDatasets, comparisonKeys },
  } = useContext(Store);

  // const spContainerDimension = height > width ? width : height;
  const spContainerDimension = n_plots === 1 ? 800 : 500;
  const classes = useStyles();
  const theme = useTheme();
  const [dataDisplay, setDataDisplay] = useState<DataDisplay>('All');

  const xs = n_plots === 1 ? 'auto' : 6;

  const loader = <CircularProgress />;

  console.log(isComparison, toJS(currentComparisonDatasets), toJS(comparisonKeys))

  const scatterPlots = plots.map((plot) => (
    <Grid key={plot.id} xs={xs} item>
      {isComparison && currentComparisonDatasets.length > 1 ? (
        <ComparisonLegend
          dataDisplay={dataDisplay}
          offset={spContainerDimension - 2 * theme.spacing(1) - 110}
          selectedPoints={selectedPoints.length > 0}
          setDataDisplay={setDataDisplay}
        />
      ) : null}

      <LabelLegend offset={spContainerDimension - 2 * theme.spacing(1) - 110} />

      <Paper elevation={3}>
        {n_plots > 1 && (
          <IconButton
            className={classes.closeIcon}
            onClick={() => {
              removePlot(plot);
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
        <Scatterplot
          dataDisplay={dataDisplay}
          originalMarks={!isComparison || currentComparisonDatasets.length < 2}
          plot={plot}
          size={spContainerDimension - 2 * theme.spacing(1)}
        />
      </Paper>
    </Grid>
  ));

  if (!currentProject || !currentDatasetKey) return <div />;

  console.log(toJS(comparisonKeys))

  return (
    <div className={classes.root}>
      <div className={classes.chips}>
        {currentProject.datasets.map((d) => (
          <Chip
            key={d.key}
            color={
              currentDatasetKey === d.key || (isComparison && comparisonKeys.includes(d.key))
                ? 'primary'
                : 'default'
            }
            disabled={
              currentDatasetKey === d.key || (isComparison && comparisonKeys.includes(d.key))
            }
            label={d.version}
            onClick={() => {
              if (isComparison) {
                loadComparisonDataset(d.key);
              } else {
                loadDatasetWithReapply(d.key);
              }
            }}
          />
        ))}

        <FormControlLabel
          control={
            <Switch
              checked={isComparison}
              color="primary"
              name="Compare Datasets"
              onChange={() => setComparison(!isComparison)}
            />
          }
          label="Compare Datasets"
          labelPlacement="end"
          value="end"
        />
      </div>
      <Grid alignItems="center" className={classes.grid} justify="center" spacing={2} container>
        {isLoadingData || isReapplying ? loader : scatterPlots}
      </Grid>
    </div>
  );
};

export default observer(Visualization);
