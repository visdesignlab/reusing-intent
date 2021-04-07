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
    width: '400px',
  },
  media: {
    height: '300px',
    margin: '0px',
    padding: '0px',
  },
  grid: {
    display: 'grid',
    gridGap: '1px',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gridTemplateRows: 'repeat(2, 1fr)',
  },
  gridContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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

    const imageList = [
      `${process.env.PUBLIC_URL}/landingPictures/clusterComplex.png`,
      `${process.env.PUBLIC_URL}/landingPictures/clusterSimple.png`,
      `${process.env.PUBLIC_URL}/landingPictures/gapminder.png`,
      `${process.env.PUBLIC_URL}/landingPictures/linearComplex.png`,
      `${process.env.PUBLIC_URL}/landingPictures/linearSimple.png`,
      `${process.env.PUBLIC_URL}/landingPictures/Outliers.png`,
    ];

    const linkList = [
      `http://localhost:3000/#/explore/?demo=cluster_complex`,
      `http://localhost:3000/#/explore/?demo=cluster_simple`,
      `http://localhost:3000/#/explore/?demo=gapminder_world`,
      `http://localhost:3000/#/explore/?demo=linear_regression_complex`,
      `http://localhost:3000/#/explore/?demo=linear_regression_simple`,
      `http://localhost:3000/#/explore/?demo=outliers`,
    ];

  return (
    <>
      <div className={classes.gridContainer}>
        <div className={classes.grid}>
          {demoList.map((curr) => {
            return (
              <Card key={curr} className={classes.root} variant="outlined">
                <CardContent>
                  <CardMedia
                    className={classes.media}
                    image={imageList[demoList.indexOf(curr)]}
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
                    <a href={linkList[demoList.indexOf(curr)]}>View Dataset</a>
                  </Button>
                  <Button color="primary" size="small">
                    <a href="https://colab.research.google.com/drive/1cyXxOEx9SEj9BoUqtOcCJ02LXWynzMVA?usp=sharing">
                      View Notebook
                    </a>
                  </Button>
                </CardActions>
              </Card>
            );
          })}
        </div>
      </div>
      <div className={classes.buttonContainer}>
        <Button
          color="primary"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          variant="outlined"
        >
          <a href="http://localhost:3000/#/project">Upload Dataset/View Project Explorer</a>
        </Button>

      </div>
    </>
  );
};

export default observer(Landing);
