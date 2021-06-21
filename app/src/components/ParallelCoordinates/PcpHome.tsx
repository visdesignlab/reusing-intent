/* eslint-disable @typescript-eslint/no-unused-vars */
import { CssBaseline, makeStyles } from '@material-ui/core';
import { isChildNode } from '@visdesignlab/trrack';
import { observer } from 'mobx-react';
import React, { FC, useContext, useEffect } from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';

import Store from '../../Store/Store';
import { Plot } from '../../Store/Types/Plot';
import { getPlotId } from '../../Utils/IDGens';
import Navbar from '../Navbar';
import Visualization from '../Visualization';
import PredictionTable from '../Predictions/PredictionTable';
import { ProvVis } from '../../trrack-vis';
import { eventConfig } from '../Explore/ExploreHome';
import Workflows from '../Workflow/Workflows';

import PcpVis from './PcpVis';

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

const PcpHome = () => {
  const classes = useStyles();

  const {
    exploreStore,
    projectStore: { loadedDataset, nodeCreationMap, approveNode, rejectNode },
    provenance,
    bundledNodes,
    loadedWorkflowId,
    loadSavedProject,
    dims,
  } = useContext(Store);

  const { addToWorkflow } = exploreStore;

  useEffect(() => {
    const current = provenance.current;

    if (isChildNode(current)) {
      if (current.children.length > 0) return;
    }

    if (!loadedDataset || exploreStore.n_plots > 0 || loadedWorkflowId || loadSavedProject) return;

    const { numericColumns } = loadedDataset;

    let x_index = 0;
    let y_index = 1;

    if (dims.length > 0) {
      const [x, y] = dims;

      x_index =
        numericColumns.findIndex((d) => d === x) !== -1
          ? numericColumns.findIndex((d) => d === x)
          : x_index;
      y_index =
        numericColumns.findIndex((d) => d === y) !== -1
          ? numericColumns.findIndex((d) => d === y)
          : y_index;
    }

    const plot: Plot = {
      type: "scatter",
      id: getPlotId(),
      x: numericColumns[x_index],
      y: numericColumns[y_index],
    };
    exploreStore.addPlot(plot);
  });

  // function brushedNodes(selected: string[])
  // {
  //   //TODO:: do this in smarter, value based way
  //   // updateBrushed(selected)
  // }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Navbar />
      <div className={classes.layout}>
        <PcpVis size={800} />
        <PredictionTable />
        <ProvVis
          key={provenance.graph.root}
          addToWorkflow={addToWorkflow}
          approvedFunction={(node: string) => approveNode(node)}
          backboneGutter={40}
          changeCurrent={(nodeID: string) => provenance.goToNode(nodeID)}
          current={provenance.graph.current}
          currentDataset={loadedDataset?.version || ''}
          ephemeralUndo={false}
          eventConfig={eventConfig}
          nodeCreationMap={nodeCreationMap}
          nodeMap={provenance.graph.nodes}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          prov={provenance as any}
          rejectedFunction={(node) => rejectNode(node)}
          root={provenance.graph.root}
          undoRedoButtons
        />
        <Workflows />
      </div>
    </div>
  );
};

export default observer(PcpHome);
