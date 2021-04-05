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
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { observer } from 'mobx-react';
import React, { FC, useContext } from 'react';

import Store from '../Store/Store';

import Scatterplot from './Scatterplot/Scatterplot';

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
    exploreStore: { plots, removePlot, isLoadingData, n_plots },
    projectStore: { currentProject, currentDatasetKey, loadDatasetWithReapply, isReapplying },
  } = useContext(Store);

  // const spContainerDimension = height > width ? width : height;
  const spContainerDimension = n_plots === 1 ? 800 : 500;
  const classes = useStyles();
  const theme = useTheme();
  const xs = n_plots === 1 ? 'auto' : 6;

  const loader = <CircularProgress />;

  const scatterPlots = plots.map((plot) => (
    <Grid key={plot.id} xs={xs} item>
      <Paper elevation={3}>
        {n_plots > 1 && (
          <IconButton className={classes.closeIcon} onClick={() => removePlot(plot)}>
            <CloseIcon />
          </IconButton>
        )}
        <Scatterplot plot={plot} size={spContainerDimension - 2 * theme.spacing(1)} />
      </Paper>
    </Grid>
  ));

  if (!currentProject || !currentDatasetKey) return <div />;

  return (
    <div className={classes.root}>
      <div className={classes.chips}>
        {currentProject.datasets.map((d) => (
          <Chip
            key={d.key}
            color={currentDatasetKey === d.key ? 'primary' : 'default'}
            disabled={currentDatasetKey === d.key}
            label={d.version}
            onClick={() => loadDatasetWithReapply(d.key)}
          />
        ))}
      </div>
      <Grid alignItems="center" className={classes.grid} justify="center" spacing={2} container>
        {isLoadingData || isReapplying ? loader : scatterPlots}
      </Grid>
    </div>
  );
};

export default observer(Visualization);
