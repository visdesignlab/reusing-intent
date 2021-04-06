import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  makeStyles,
  Typography,
} from '@material-ui/core';
import { observer } from 'mobx-react';
import React from 'react';

const useStyles = makeStyles({
  root: {
    maxWidth: 400,
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9,
    marginTop: '30',
  },
});

const Landing = () => {
  const classes = useStyles();

  const demoList = [
    'Cluster Complex',
    'Cluster Simple',
    'Gapminder World',
    'Linear Regression Complex',
    'Linear Regression Simple',
    'Outliers',
  ];

  return (
    <>
      {demoList.map((curr) => {
        return (
          <Card key={curr} className={classes.root} variant="outlined">
            <CardContent>
              <CardMedia
                className={classes.media}
                image={`${process.env.PUBLIC_URL}/landingPictures/clusterComplex.png`}
                title="Cluster Complex Version 1"
              />
            </CardContent>
            <CardContent>
              <Typography component="h2" variant="h5" gutterBottom>
                {curr}
              </Typography>
            </CardContent>
            <CardActions>
              <Button color="primary" size="small">
                View Dataset
              </Button>
              <Button color="primary" size="small">
                View Notebook
              </Button>
            </CardActions>
          </Card>
        );
      })}
    </>
  );
};

export default observer(Landing);
