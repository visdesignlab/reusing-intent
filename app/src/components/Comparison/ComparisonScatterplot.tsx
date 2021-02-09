import {
  Button,
  CircularProgress,
  createStyles,
  Grid,
  IconButton,
  makeStyles,
  Paper,
  Theme,
  useTheme,
} from '@material-ui/core';
import { CloseIcon } from '@material-ui/x-grid';
import { observer } from 'mobx-react';
import React, { FC, useContext, useState } from 'react';

import Store from '../../Store/Store';
import Scatterplot from '../Scatterplot/Scatterplot';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: theme.spacing(2),
      overflow: 'auto',
    },
    grid: {
      height: '100%',
    },
    closeIcon: {
      position: 'absolute',
    },
  }),
);

export type DataDisplay = 'Original' | 'Diff' | 'Comparison' | 'All';

const CompVis: FC = () => {
  const { plots, removePlot, isLoadingData, n_plots } = useContext(Store).exploreStore;

  // const spContainerDimension = height > width ? width : height;
  const spContainerDimension = n_plots === 1 ? 800 : 500;

  const [dataDisplay, setDataDisplay] = useState<DataDisplay>('All');
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
        <div>
          <Button
            color="primary"
            variant="outlined"
            onMouseOut={() => {
              setDataDisplay('All');
            }}
            onMouseOver={() => {
              setDataDisplay('Original');
            }}
          >
            Original Data
          </Button>
          <Button
            color="primary"
            variant="outlined"
            onMouseOut={() => {
              setDataDisplay('All');
            }}
            onMouseOver={() => {
              setDataDisplay('Comparison');
            }}
          >
            Comparison Data
          </Button>
          <Button
            color="primary"
            variant="outlined"
            onMouseOut={() => {
              setDataDisplay('All');
            }}
            onMouseOver={() => {
              setDataDisplay('Diff');
            }}
          >
            Shifted Data
          </Button>
        </div>
        <Scatterplot
          dataDisplay={dataDisplay}
          originalMarks={false}
          plot={plot}
          size={spContainerDimension - 2 * theme.spacing(1)}
        />
      </Paper>
    </Grid>
  ));

  // console.log(prov);

  return (
    <div className={classes.root}>
      <Grid alignItems="center" className={classes.grid} justify="center" spacing={2} container>
        {isLoadingData ? loader : scatterPlots}
      </Grid>
    </div>
  );
};

export default observer(CompVis);
