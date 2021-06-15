import {
  Card,
  CardActions,
  CardContent,
  IconButton,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { isChildNode } from '@visdesignlab/trrack';
import { observer } from 'mobx-react';
import { useContext } from 'react';

import Store from '../../Store/Store';

type Props = {
  id: string;
};

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  close: {
    marginLeft: 'auto',
  },
}));

const Action = ({ id }: Props) => {
  const classes = useStyles();
  const {
    provenance,
    provenance: {
      graph: { nodes },
    },
    exploreStore: { removeFromWorkflow, currentDatasetKey },
  } = useContext(Store);

  const node = nodes[id];

  let isRejected = false;

  const artifact = provenance.getLatestArtifact(id);

  if (artifact) {
    if (!currentDatasetKey) {
      isRejected = false;
    } else {
      isRejected = artifact.artifact.status_record[currentDatasetKey] === 'Rejected';
    }
  }

  //also show annotation,
  return (
    <Card className={classes.card} variant="outlined">
      <CardContent>
        <CardActions disableSpacing>
          <div>
            <Typography
              color={isRejected ? 'textSecondary' : 'textPrimary'}
              display="block"
              variant="button"
            >
              {node.label}
            </Typography>
            <Typography color="textSecondary" display="block" variant="subtitle2">
              {/* <div>{node.label}</div> */}
              {isChildNode(node) &&
              node.artifacts &&
              node.artifacts.annotations &&
              provenance.getLatestAnnotation(node.id)
                ? provenance.getLatestAnnotation(node.id)?.annotation
                : ''}
            </Typography>
          </div>
          <IconButton
            className={classes.close}
            color="secondary"
            disabled={isRejected}
            size="small"
            onClick={() => removeFromWorkflow(id)}
          >
            <CloseIcon />
          </IconButton>
        </CardActions>
      </CardContent>
    </Card>
  );
};

export default observer(Action);
