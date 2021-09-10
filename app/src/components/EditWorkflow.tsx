import {
  Button,
  createStyles,
  IconButton,
  Input,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import CloseButton from '@material-ui/icons/Close';
import SyncIcon from '@material-ui/icons/Sync';
import SyncDisabledIcon from '@material-ui/icons/SyncDisabled';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from '@material-ui/lab';
import { observer } from 'mobx-react';
import { useState } from 'react';

import { useStore } from '../stores/RootStore';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minWidth: 450,
      display: 'grid',
      gridTemplateRows: 'min-content min-content 1fr',
    },
    add: {
      margin: '0 auto',
    },
    margin: {
      margin: theme.spacing(1),
    },
    icon: {
      margin: theme.spacing(2),
    },
  }),
);

const EditWorkflow = () => {
  const styles = useStyles();
  const {
    exploreStore: { workflow },
  } = useStore();
  const [workflowName, setWorkflowName] = useState('');

  if (!workflow) return <div>Error</div>;

  const {
    setCurrentWorkflow,
    currentWorkflow,
    setWorkflowName: swn,
    removeFromWorkflow,
    isSyncing,
    toggleSync,
  } = workflow;

  const order = currentWorkflow?.order || [];

  return (
    <div className={styles.root}>
      <div className={styles.add}>
        {!currentWorkflow ? (
          <Button
            disabled={Boolean(currentWorkflow)}
            onClick={() => {
              setCurrentWorkflow();
            }}
          >
            Create New Workflow
          </Button>
        ) : (
          <div className={styles.margin}>
            <Button
              color="primary"
              disabled={!currentWorkflow.name}
              variant="contained"
              onClick={toggleSync}
            >
              {isSyncing === 'Syncing' ? 'Stop' : 'Start'} Sync
            </Button>
            <IconButton disableFocusRipple disableRipple>
              {isSyncing === 'Not Syncing' && <SyncDisabledIcon />}
              {isSyncing === 'Syncing' && <SyncIcon />}
            </IconButton>
          </div>
        )}
      </div>
      {currentWorkflow && currentWorkflow.name === '' && (
        <div className={styles.add}>
          <Input
            placeholder="Workflow Name"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
          />
          <IconButton disabled={workflowName === ''} onClick={() => swn(workflowName)}>
            <CheckIcon />
          </IconButton>
        </div>
      )}
      {currentWorkflow && currentWorkflow.name !== '' && (
        <div className={styles.add}>
          <Typography variant="button">{currentWorkflow.name}</Typography>
        </div>
      )}
      {currentWorkflow && currentWorkflow.graph && (
        <div>
          <Timeline>
            {order.map((id, idx) => {
              const node = currentWorkflow.graph?.nodes[id];

              if (!node) return null;

              return (
                <TimelineItem key={node.id}>
                  <TimelineOppositeContent>
                    <IconButton
                      color="secondary"
                      size="small"
                      onClick={() => removeFromWorkflow(node.id)}
                    >
                      <CloseButton />
                    </IconButton>
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color="primary" />
                    {idx !== order.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>{node.label}</TimelineContent>
                </TimelineItem>
              );
            })}
          </Timeline>
        </div>
      )}
      {!currentWorkflow && (
        <div className={styles.add}>
          <Typography variant="button">No custom workflow to edit</Typography>
        </div>
      )}
    </div>
  );
};

export default observer(EditWorkflow);
