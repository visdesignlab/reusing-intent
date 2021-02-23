/* eslint-disable @typescript-eslint/no-unused-vars */
import { CssBaseline, makeStyles } from '@material-ui/core';
import { isChildNode } from '@visdesignlab/trrack';
import { ProvVis } from '@visdesignlab/trrack-vis';
import { observer } from 'mobx-react';
import React, { FC, useContext, useEffect } from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';

import Store from '../../Store/Store';
import { Plot } from '../../Store/Types/Plot';
import { getPlotId } from '../../Utils/IDGens';
import { eventConfig } from '../Explore/ExploreHome';
import Navbar from '../Navbar';

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
    projectStore: { loadedDataset, comparisonDataset },
    provenance,
    setQueryParams,
  } = useContext(Store);

  useEffect(() => {
    setQueryParams(location.search);
  }, [location.search, setQueryParams]);

  useEffect(() => {
    const current = provenance.current;

    if (isChildNode(current)) {
      if (current.children.length > 0) return;
    }

    if (n_plots > 0 || !loadedDataset) return;
    const { numericColumns } = loadedDataset;
    const plot: Plot = {
      id: getPlotId(),
      x: numericColumns[0],
      y: numericColumns[1],
      brushes: {},
      selectedPoints: [],
    };
    addPlot(plot);
  });

  const classes = useStyles();

  if (!comparisonDataset)
    return <Redirect to={{ pathname: '/project', search: location.search }} />;

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Navbar />
      <div className={classes.layout}>
        <ComparisonScatterplot />
        <ProvVis
          changeCurrent={(nodeID: string) => provenance.goToNode(nodeID)}
          current={provenance.graph.current}
          ephemeralUndo={false}
          eventConfig={eventConfig}
          nodeMap={provenance.graph.nodes}
          prov={provenance}
          root={provenance.graph.root}
          undoRedoButtons
        />
      </div>
    </div>
  );
};

export default observer(ComparisonHome);
