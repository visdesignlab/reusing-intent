/* eslint-disable @typescript-eslint/no-unused-vars */
import { createStyles, CssBaseline, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react';
import React, { FC, useContext, useEffect } from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';

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

const ProjectHome: FC<RouteComponentProps> = ({ location }: RouteComponentProps) => {
  const classes = useStyles();
  const {
    projectStore: { currentProject, loadedDataset },
    setQueryParams,
    debug,
    redirectPath,
    search,
  } = useContext(Store);

  useEffect(() => {
    setQueryParams(location.search);
  }, [location.search, setQueryParams]);

  const instructions = 'Please select a project';

  if (debug && redirectPath === 'explore' && loadedDataset)
    return <Redirect to={{ pathname: '/explore', search }} />;

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Sidebar />
      {currentProject ? <ProjectView /> : instructions}
    </div>
  );
};

export default observer(ProjectHome);
