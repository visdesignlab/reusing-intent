import { createStyles, makeStyles, Paper, Theme } from '@material-ui/core';
import { observer } from 'mobx-react';
import React, { FC, useContext, useEffect, useRef, useState } from 'react';

import IntentStore from '../Store/Store';

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
      },
    }),
  }),
);

const Visualization: FC = () => {
  const visRef = useRef<HTMLDivElement>(null);
  const { plots } = useContext(IntentStore);
  const [dimension, setDimension] = useState(-1);
  const classes = useStyles({ dimension: dimension > 0 ? dimension : 0 });

  useEffect(() => {
    const { current } = visRef;

    if (!current || plots.length === 0) return;
    const [height, width] = [current.clientHeight, current.clientWidth];

    let dim = height > width ? width : height;

    if (plots.length > 1) {
      dim = dim / 2;
      dim = Math.min(dim, height, width);
    }

    setDimension(dim);
  }, [plots]);

  return (
    <div ref={visRef} className={classes.root}>
      {plots.map((plot) => (
        <Paper key={plot.id} elevation={3}>
          <pre>{JSON.stringify(plot, null, 4)}</pre>
        </Paper>
      ))}
    </div>
  );
};

export default observer(Visualization);
