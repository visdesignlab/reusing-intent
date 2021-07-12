/* eslint-disable @typescript-eslint/no-unused-vars */
import { CssBaseline, makeStyles } from '@material-ui/core';
import { isChildNode } from '@visdesignlab/trrack';
import { observer } from 'mobx-react';
import React, { FC, useContext, useEffect, useCallback } from 'react';
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
import BrushComponent, { BrushSelections } from '../Brush/Components/BrushComponent';
import { BrushCollection, BrushAffectType } from '../Brush/Types/Brush';
import { ExtendedBrushCollection } from '../../Store/IntentState';

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

type Props = {
  plot: Plot;
};

const PcpHome: FC<Props> = ({plot} : Props) => {
  const classes = useStyles();

  const {
    exploreStore: {addToWorkflow, setBrushSelection, n_plots, addPlot},
    projectStore: { loadedDataset, nodeCreationMap, approveNode, rejectNode },
    provenance,
    bundledNodes,
    loadedWorkflowId,
    loadSavedProject,
    dims,
  } = useContext(Store);

  useEffect(() => {
    const current = provenance.current;

    if (isChildNode(current)) {
      if (current.children.length > 0) return;
    }

    if (!loadedDataset || n_plots > 0 || loadedWorkflowId || loadSavedProject) return;

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



    addPlot(plot);
  });

  const rectBrushHandler = useCallback(
    (
      selection: BrushSelections,
      brushes: BrushCollection,
      type: BrushAffectType,
      affectedId: string,
    ) => {
      const brs: ExtendedBrushCollection = {};

      Object.entries(brushes).forEach((entry) => {
        const [id, val] = entry;

        brs[id] = { ...val, points: selection[id] };
      });

      setBrushSelection(plot, brs, type, affectedId);
    },
    [plot, setBrushSelection],
  );

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
        <PcpVis plot={plot} size={800} />
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
