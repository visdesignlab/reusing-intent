/* eslint-disable @typescript-eslint/no-unused-vars */
import { CssBaseline, makeStyles } from '@material-ui/core';
import { isChildNode } from '@visdesignlab/trrack';
import { observer } from 'mobx-react';
import React, { FC, useContext, useEffect } from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';

import { ProvVis } from '../../trrack-vis/index';
import Store from '../../Store/Store';
import { Plot } from '../../Store/Types/Plot';
import { getPlotId } from '../../Utils/IDGens';
import { eventConfig } from '../Explore/ExploreHome';

import ComparisonScatterplot from './ComparisonScatterplot';

const useStyles = makeStyles(() => ({
  root: {
    '.red': {
      backgroundColor: '#ff8080',
    },
    '.green': {
      backgroundColor: '#90EE90',
    },
    '.yellow': {
      backgroundColor: '#ffff8b',
    },
    display: 'grid',
    height: '100vh',
    width: '100vw',
    gridTemplateRows: 'min-content 1fr',
    overflow: 'hidden',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '5fr 2fr',
    overflow: 'hidden',
  },
}));

const ComparisonHome: FC<RouteComponentProps> = ({ location }: RouteComponentProps) => {
  const {
    exploreStore: { n_plots, addPlot },
    projectStore: { loadedDataset },
    provenance,
    setQueryParams,
    loadedWorkflowId,
    loadSavedProject
  } = useContext(Store);

  useEffect(() => {
    setQueryParams(location.search);
  }, [location.search, setQueryParams]);

  useEffect(() => {
    const current = provenance.current;

    if (isChildNode(current)) {
      if (current.children.length > 0) return;
    }

    if (n_plots > 0 || !loadedDataset || loadedWorkflowId || loadSavedProject) return;
    const { numericColumns } = loadedDataset;
    const plot: Plot = {
      id: getPlotId(),
      x: numericColumns[0],
      y: numericColumns[1],
    };
    addPlot(plot);
  });

  const classes = useStyles();
  
  return (
    <div className={classes.root}>
      <CssBaseline />
      <div className={classes.layout}>
        <ComparisonScatterplot />
      </div>
    </div>
  );
};

export default observer(ComparisonHome);
