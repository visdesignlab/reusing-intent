import { observer } from 'mobx-react';
import React from 'react';
import { Card, CardActionArea, CardMedia, CardContent, Typography, CardActions, Button, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
  root: {
    maxWidth: 400,
  },
  media: {
    height: 400,
  },
});

const Landing = () => {
    const classes = useStyles();

    const demoList = ["Cluster Complex", "Cluster Simple", "Gapminder World", "Linear Regression Complex", "Linear Regression Simple", "Outliers"]

    return (
    <>
        {demoList.map((curr) => {
            return (
              <Card key={curr} className={classes.root} variant="outlined">
                <CardActionArea>
                  <CardMedia
                    className={classes.media}
                    image="../../../public/landingPictures/clusterComplex.png"
                    title="Cluster Complex Version 1"
                />
                  <CardContent>
                    <Typography component="h2" variant="h5" gutterBottom>
                      {curr}
                    </Typography>
                    <Typography color="textSecondary" component="p" variant="body2" />
                  </CardContent>
                </CardActionArea>
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
