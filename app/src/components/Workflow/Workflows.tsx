/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  makeStyles,
  Paper,
  Theme,
  Typography,
} from '@material-ui/core';
import { observer } from 'mobx-react';
import React, { useContext } from 'react';

import Store from '../../Store/Store';

import Workflow from './Workflow';

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

const Workflows = () => {
  const classes = useStyles();
  const {
    exploreStore: { workflows, addWorkflow },
  } = useContext(Store);

  return (
    <Paper className={classes.root}>
      <Typography
        align="center"
        style={{
          fontWeight: 'bold',
          fill: '#F2',
          fontSize: '18px',
          fontFamily: 'Lato, Helvetica Neue,Arial,Helvetica,sans-serif',
        }}
        variant="h4"
      >
        Workflows
      </Typography>
      <Divider />
      <Card style={{ border: 'none', boxShadow: 'none' }} variant="outlined">
        <CardActions>
          <Button color="primary" onClick={() => addWorkflow()}>
            Add Workflow
          </Button>
        </CardActions>
        <CardContent>
          {Object.values(workflows).map((d) => {
            return <Workflow key={d.id} workflow={d} />;
          })}
        </CardContent>
      </Card>
    </Paper>
  );
};

export default observer(Workflows);
