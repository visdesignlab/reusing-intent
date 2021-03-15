import { Card, CardContent, makeStyles, Theme } from '@material-ui/core';
import React from 'react';

type Props = {
  label: string;
};

const useStyles = makeStyles((theme: Theme) => ({
  card: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));

const Action = ({ label }: Props) => {
  const classes = useStyles();

  return (
    <Card className={classes.card} variant="outlined">
      <CardContent>{label}</CardContent>
    </Card>
  );
};

export default Action;
