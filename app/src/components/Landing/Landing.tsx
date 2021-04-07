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
import { Link } from 'react-router-dom';

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
    'Cluster Complex Demo',
    'Cluster Simple Demo',
    'Gapminder World Demo',
    'Linear Regression Complex Demo',
    'Linear Regression Simple Demo',
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
    `https://reapply-workflows.github.io/reapply_workflows/#/explore?demo=cluster_complex`,
    `https://reapply-workflows.github.io/reapply_workflows/#/explore?demo=cluster_simple`,
    `https://reapply-workflows.github.io/reapply_workflows/#/explore?demo=gapminder_world`,
    `https://reapply-workflows.github.io/reapply_workflows/#/explore?demo=linear_regression_complex`,
    `https://reapply-workflows.github.io/reapply_workflows/#/explore?demo=linear_regression_simple`,
    `https://reapply-workflows.github.io/reapply_workflows/#/explore?demo=outliers`,
  ];

  const colabLinkList = [
    `https://colab.research.google.com/drive/18GdpjL9LD5tQBFoWgAjBScWtjvX9WNA8?usp=sharing`,
    `https://colab.research.google.com/drive/1WdzfTqhSgCML1iq9inw03Z64Lj8qHc1a?usp=sharing`,
    `https://colab.research.google.com/drive/1E_5Pw0905aGOnYUo7-RwI2pq2WvTI-j4?usp=sharing`,
    `https://colab.research.google.com/drive/16DJRqPHgoAw1EFwiKm4PmihG3BRHdOxj?usp=sharing`,
    `https://colab.research.google.com/drive/1zsupVPrE0rxCZfKR3MlS0DIagvBeP55O?usp=sharing`,
    `https://colab.research.google.com/drive/1uds9y6vKaZDRjfRCVLbbyBjij6T6i3Vb?usp=sharing`,
  ];

  return (
    <>
      <Typography
        align="center"
        style={{
          margin: '20px',
          fontWeight: 'bold',
          fill: '#F2',
          fontSize: '36px',
          fontFamily: 'Lato, Helvetica Neue,Arial,Helvetica,sans-serif',
        }}
        variant="h1"
      >
        Reusing Interactive Analysis Workflows
      </Typography>

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
                    <a href={colabLinkList[demoList.indexOf(curr)]}>View Notebook</a>
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
          component={Link}
          to="/project"
          variant="outlined"
        >
          Project Explorer
        </Button>
      </div>
    </>
  );
};

export default observer(Landing);
