import { createStyles, makeStyles, Theme } from '@material-ui/core';
import { observer } from 'mobx-react';

import CustomWorkflowView from './CustomWorkflowView';
import EditWorkflow from './EditWorkflow';
import ProvenanceTree from './ProvenanceTree';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      minWidth: '500px',
      display: 'grid',
      gridTemplateColumns: 'min-content 1fr 1fr',
      margin: theme.spacing(1),
      overflow: 'hidden',
    },
  }),
);

const WorkflowMenu = () => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <div>
        <ProvenanceTree />
      </div>
      <EditWorkflow />
      <CustomWorkflowView />
    </div>
  );
};

export default observer(WorkflowMenu);
