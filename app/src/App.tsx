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
    overflow: 'hidden',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '5fr 1.5fr',
    overflow: 'hidden',
  },
}));

const App: FC = () => {
  const classes = useStyles();

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Navbar />
      <div className={classes.layout}>
        <Visualization />
        <div>Test</div>
      </div>
    </div>
  );
};

export default App;
