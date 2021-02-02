/* eslint-disable @typescript-eslint/no-unused-vars */
import { createStyles, makeStyles, useTheme, Button, TableContainer, CssBaseline } from '@material-ui/core';
import { select } from 'd3';
import { observer } from 'mobx-react';
import React, { FC, useCallback, useContext, useState, useEffect } from 'react';
import { ProvVis } from '@visdesignlab/trrack-vis';
import { isChildNode } from '@visdesignlab/trrack';

import Store from '../../Store/Store';
import { eventConfig } from "../../App"
import { Plot } from '../../Store/Types/Plot';
import Visualization from '../Visualization';
import Navbar from '../Navbar';
import { getPlotId } from '../../Utils/IDGens';

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



const ComparisonHome = () => {
      const {
        exploreStore: {
          n_plots,
          addPlot,
        },
        projectStore: { loadedDataset },
        provenance,
      } = useContext(Store);

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

    return (
    <div className={classes.root}>
        <CssBaseline />
        <Navbar />
        <div className={classes.layout}>
        <Visualization />
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
