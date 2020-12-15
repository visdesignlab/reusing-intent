import { CssBaseline, makeStyles } from '@material-ui/core';
import React, { FC } from 'react';

import Navbar from './components/Navbar';
import Visualization from './components/Visualization';

const useStyles = makeStyles(() => ({
  root: {
    display: 'grid',
    height: '100vh',
    width: '100vw',
    gridTemplateRows: 'min-content 1fr',
  },
}));

const App: FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Navbar />
      <Visualization />
    </div>
  );
};

export default App;
