/* eslint-disable @typescript-eslint/no-unused-vars */
import { createStyles, CssBaseline, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react';
import React, { useContext } from 'react';

import Store from '../../Store/Store';

import ProjectView from './ProjectView';
import Sidebar from './Sidebar';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: 'flex',
    },
  }),
);

const ProjectHome = () => {
  const classes = useStyles();
  const { currentProject } = useContext(Store).projectStore;

  const instructions = 'Please select a project';

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Sidebar />
      {currentProject ? <ProjectView /> : instructions}
    </div>
  );
};

export default observer(ProjectHome);
