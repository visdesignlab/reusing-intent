import { createStyles, Grid, makeStyles, Paper, Theme, useTheme } from '@material-ui/core';
import { observer } from 'mobx-react';
import React, { FC, useContext } from 'react';

import IntentStore from '../Store/Store';

import Scatterplot from './Scatterplot.tsx/Scatterplot';

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
    paper: () => ({}),
  }),
);

const Visualization: FC = () => {
  const { plots } = useContext(IntentStore);

  // const spContainerDimension = height > width ? width : height;
  const spContainerDimension = plots.length === 1 ? 800 : 650;
  const classes = useStyles();
  const theme = useTheme();
  const xs = plots.length === 1 ? 'auto' : 6;

  return (
    <div className={classes.root}>
      <Grid alignItems="center" className={classes.grid} justify="center" spacing={2} container>
        {plots.map((plot) => (
          <Grid key={plot.id} xs={xs} item>
            <Paper elevation={3}>
              <Scatterplot plot={plot} size={spContainerDimension - 2 * theme.spacing(1)} />
            </Paper>
          </Grid>
        ))}
      </Grid>
    </div>
  );
};

export default observer(Visualization);
