/* eslint-disable no-constant-condition */
import {
  Badge,
  Card,
  CardActions,
  CardContent,
  Divider,
  IconButton,
  makeStyles,
  Snackbar,
  Theme,
} from '@material-ui/core';
import { green, red } from '@material-ui/core/colors';
import CloseIcon from '@material-ui/icons/Close';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import ShareIcon from '@material-ui/icons/Share';
import { Alert } from '@material-ui/lab';
import { observer } from 'mobx-react';
import React, { useCallback, useContext, useState } from 'react';

import { WorkflowType } from '../../Store/ExploreStore';
import Store from '../../Store/Store';
import Editable from '../Editable';

import Action from './Action';
import { initializeFirebase, storeToFirebase } from './Firebase';

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  close: {
    marginLeft: 'auto',
  },
  badge_sync: {
    backgroundColor: green[500],
  },
  badge_unsync: {
    backgroundColor: red[500],
  },
}));

type Props = {
  workflow: WorkflowType;
};

const Workflow = ({ workflow }: Props) => {
  const classes = useStyles();
  const {
    exploreStore: {
      workflows,
      renameWorkflow,
      currentWorkflow,
      setCurrentWorkflow,
      removeWorkflow,
      workflowSyncStatus,
      setSyncStatus,
    },
    provenance,
  } = useContext(Store);

  const [openCopyMessage, setOpenCopyMessage] = useState(true);

  const { id } = workflow;

  const isSync = workflowSyncStatus[id]
    ? workflowSyncStatus[id] === JSON.stringify(workflow)
    : false;

  const { db } = initializeFirebase();

  const isCurrent = id === currentWorkflow;

  const handleType = useCallback((text) => renameWorkflow(id, text), [id, renameWorkflow]);

  const copyId = useCallback(() => {
    const el = document.createElement('textarea');
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-99999px';
    el.value = id;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setOpenCopyMessage(true);
  }, [id]);

  return (
    <>
      <Card className={classes.card} variant="outlined" onClick={() => setCurrentWorkflow(id)}>
        <CardContent>
          <CardActions disableSpacing>
            <Badge
              classes={{ badge: isSync ? classes.badge_sync : classes.badge_unsync }}
              color="primary"
              variant="dot"
            >
              <Editable
                color={isCurrent ? 'textPrimary' : 'textSecondary'}
                handleType={handleType}
                text={workflow.name}
              />
            </Badge>
            {isSync || true ? (
              <IconButton
                className={classes.close}
                disabled={workflow.graph.length === 0}
                size="small"
                onClick={() =>
                  storeToFirebase(id, provenance.graph, workflows[id], db, setSyncStatus)
                }
              >
                <ShareIcon />
              </IconButton>
            ) : (
              <IconButton
                className={classes.close}
                disabled={workflow.graph.length === 0}
                size="small"
                onClick={copyId}
              >
                <FileCopyIcon />
              </IconButton>
            )}
            <IconButton size="small" onClick={() => removeWorkflow(id)}>
              <CloseIcon />
            </IconButton>
          </CardActions>
          <Divider />
          {Object.values(workflow.graph).map((id) => (
            <Action key={id} id={id} />
          ))}
        </CardContent>
      </Card>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        autoHideDuration={1000}
        open={openCopyMessage}
        onClose={() => setOpenCopyMessage(false)}
      >
        <Alert>{`Copied workflow id: ${id}`}</Alert>
      </Snackbar>
    </>
  );
};

export default observer(Workflow);
