import {
  Card,
  CardActions,
  CardContent,
  Divider,
  IconButton,
  makeStyles,
  Theme,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import ShareIcon from '@material-ui/icons/Share';
import { observer } from 'mobx-react';
import React, { useCallback, useContext } from 'react';

import { WorkflowType } from '../../Store/ExploreStore';
import Store from '../../Store/Store';
import Editable from '../Editable';

import Action from './Action';
import { storeToFirebase, initializeFirebase } from './Firebase';

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  close: {
    marginLeft: 'auto',
  },
}));

type Props = {
  workflow: WorkflowType;
};

const Workflow = ({ workflow }: Props) => {
  const classes = useStyles();
  const {
    exploreStore: { workflows, renameWorkflow, currentWorkflow, setCurrentWorkflow, removeWorkflow },
  } = useContext(Store);

  const { id } = workflow;

  const { db } = initializeFirebase();

  const isCurrent = id === currentWorkflow;

  const handleType = useCallback((text) => renameWorkflow(id, text), [id, renameWorkflow]);

  return (
    <Card className={classes.card} variant="outlined" onClick={() => setCurrentWorkflow(id)}>
      <CardContent>
        <CardActions disableSpacing>
          <Editable
            color={isCurrent ? 'textPrimary' : 'textSecondary'}
            handleType={handleType}
            text={workflow.name}
          />
          <IconButton className={classes.close} size="small" onClick={() => storeToFirebase(id, workflows[id], db)}>
            <ShareIcon />
          </IconButton>
          <IconButton size="small" onClick={() => removeWorkflow(id)}>
            <CloseIcon />
          </IconButton>
        </CardActions>
        <Divider />
        {Object.values(workflow.interactions).map((d) => (
          <Action key={d.id} id={d.id} />
        ))}
      </CardContent>
    </Card>
  );
};

export default observer(Workflow);
