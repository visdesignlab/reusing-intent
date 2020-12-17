import { createStyles, makeStyles, Paper, Theme, useTheme } from '@material-ui/core';
import useComponentSize from '@rehooks/component-size';
import { observer } from 'mobx-react';
import React, { FC, useContext, useRef } from 'react';

import IntentStore from '../Store/Store';

import Scatterplot from './Scatterplot.tsx/Scatterplot';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: (props: { dimension: number }) => ({
      display: 'flex',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing(1),
      '& > *': {
        width: props.dimension - theme.spacing(2),
        height: props.dimension - theme.spacing(2),
        padding: theme.spacing(1),
      },
    }),
  }),
);

const Visualization: FC = () => {
  const visRef = useRef(null);
  const { height, width } = useComponentSize(visRef);
  const { plots } = useContext(IntentStore);

  const spContainerDimension = height > width ? width : height;
  const classes = useStyles({ dimension: spContainerDimension });
  const theme = useTheme();

  return (
    <div ref={visRef} className={classes.root}>
      {plots.map((plot) => (
        <Paper key={plot.id} elevation={3}>
          <Scatterplot plot={plot} size={spContainerDimension - 2 * theme.spacing(1)} />
        </Paper>
      ))}
    </div>
  );
};

export default observer(Visualization);
