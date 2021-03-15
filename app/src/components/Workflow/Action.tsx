import {
  Card,
  CardActions,
  CardContent,
  IconButton,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import { CloseIcon } from '@material-ui/data-grid';
import { observer } from 'mobx-react';
import React, { useContext } from 'react';

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
    provenance: {
      graph: { nodes },
    },
    exploreStore: { removeFromWorkflow },
  } = useContext(Store);

  return (
    <Card className={classes.card} variant="outlined">
      <CardActions disableSpacing>
        <IconButton
          className={classes.close}
          color="secondary"
          size="small"
          onClick={() => removeFromWorkflow(id)}
        >
          <CloseIcon />
        </IconButton>
      </CardActions>
      <CardContent>
        <Typography variant="button">{nodes[id].label}</Typography>
      </CardContent>
    </Card>
  );
};

export default observer(Action);
