import { Divider, makeStyles, Paper, Theme, Typography } from '@material-ui/core';
import { observer } from 'mobx-react';
import React, { useContext } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import Store from '../../Store/Store';

import Action from './Action';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    margin: theme.spacing(2),
    padding: theme.spacing(1),
  },
  card: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

// type Props = {
//   test?: string;
// };

const Workflow = () => {
  const classes = useStyles();
  const {
    exploreStore: { workflow },
  } = useContext(Store);

  return (
    <Paper className={classes.root}>
      <Typography align="center" variant="h4">
        Workflow
      </Typography>
      <Divider />
      <DndProvider backend={HTML5Backend}>
        {workflow.map((d) => {
          return <Action key={d} id={d} />;
        })}
      </DndProvider>
    </Paper>
  );
};

export default observer(Workflow);
