/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CssBaseline,
  IconButton,
  makeStyles,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@material-ui/core';
import TouchAppIcon from '@material-ui/icons/TouchApp';
import { isChildNode } from '@visdesignlab/trrack';
import { EventConfig, ProvVis } from '@visdesignlab/trrack-vis';
import { selectAll } from 'd3';
import { observer } from 'mobx-react';
import React, { FC, useContext, useEffect } from 'react';
import { Redirect } from 'react-router-dom';

import {
  AddBrush,
  AddPlot,
  ChangeBrush,
  ChangeBrushSize,
  ChangeBrushType,
  ChangeCategory,
  ClearAll,
  Invert,
  LoadDataset,
  LockPrediction,
  MultiBrush,
  PointDeselection,
  PointSelection,
  RemoveBrush,
  SwitchCategoryVisibility,
  TurnPrediction,
} from './components/Icons';
import Navbar from './components/Navbar';
import useScatterplotStyle from './components/Scatterplot.tsx/styles';
import Visualization from './components/Visualization';
import Store from './Store/Store';
import { IntentEvents } from './Store/Types/IntentEvents';
import { Plot } from './Store/Types/Plot';
import { getPlotId } from './Utils/IDGens';

export type Bundle = {
  metadata: unknown;
  bundleLabel: string;
  bunchedNodes: string[];
};

export type BundleMap = { [key: string]: Bundle };

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
    gridTemplateColumns: '5fr 2fr 1.3fr',
    overflow: 'hidden',
  },
}));

export const eventConfig: EventConfig<IntentEvents> = {
  'Load Dataset': {
    backboneGlyph: <LoadDataset size={22} />,
    currentGlyph: <LoadDataset fill="#2185d0" size={22} />,
    regularGlyph: <LoadDataset size={16} />,
    bundleGlyph: <LoadDataset fill="#2185d0" size={22} />,
  },
  MultiBrush: {
    backboneGlyph: <MultiBrush size={22} />,
    currentGlyph: <MultiBrush fill="#2185d0" size={22} />,
    regularGlyph: <MultiBrush size={16} />,
    bundleGlyph: <MultiBrush fill="#2185d0" size={22} />,
  },
  'Switch Category Visibility': {
    backboneGlyph: <SwitchCategoryVisibility size={22} />,
    currentGlyph: <SwitchCategoryVisibility fill="#2185d0" size={22} />,
    regularGlyph: <SwitchCategoryVisibility size={16} />,
    bundleGlyph: <SwitchCategoryVisibility fill="#2185d0" size={22} />,
  },
  'Change Category': {
    backboneGlyph: <ChangeCategory size={22} />,
    currentGlyph: <ChangeCategory fill="#2185d0" size={22} />,
    regularGlyph: <ChangeCategory size={16} />,
    bundleGlyph: <ChangeCategory fill="#2185d0" size={22} />,
  },
  'Add Plot': {
    backboneGlyph: <AddPlot size={22} />,
    currentGlyph: <AddPlot fill="#2185d0" size={22} />,
    regularGlyph: <AddPlot size={16} />,
    bundleGlyph: <AddPlot fill="#2185d0" size={22} />,
  },
  'Point Selection': {
    backboneGlyph: <PointSelection size={22} />,
    currentGlyph: <PointSelection fill="#2185d0" size={22} />,
    regularGlyph: <PointSelection size={16} />,
    bundleGlyph: <PointSelection fill="#2185d0" size={22} />,
  },
  'Point Deselection': {
    backboneGlyph: <PointDeselection size={22} />,
    currentGlyph: <PointDeselection fill="#2185d0" size={22} />,
    regularGlyph: <PointDeselection size={16} />,
    bundleGlyph: <PointDeselection fill="#2185d0" size={22} />,
  },
  'Add Brush': {
    backboneGlyph: <AddBrush size={22} />,
    currentGlyph: <AddBrush fill="#2185d0" size={22} />,
    regularGlyph: <AddBrush size={16} />,
    bundleGlyph: <AddBrush fill="#2185d0" size={22} />,
  },
  'Lock Prediction': {
    backboneGlyph: <LockPrediction size={22} />,
    currentGlyph: <LockPrediction fill="#2185d0" size={22} />,
    regularGlyph: <LockPrediction size={16} />,
    bundleGlyph: <LockPrediction fill="rgb(248, 191, 132)" size={22} />,
  },
  'Turn Prediction': {
    backboneGlyph: <TurnPrediction size={22} />,
    currentGlyph: <TurnPrediction fill="#2185d0" size={22} />,
    regularGlyph: <TurnPrediction size={16} />,
    bundleGlyph: <TurnPrediction fill="#2185d0" size={22} />,
  },
  Invert: {
    backboneGlyph: <Invert size={22} />,
    currentGlyph: <Invert fill="#2185d0" size={22} />,
    regularGlyph: <Invert size={16} />,
    bundleGlyph: <Invert fill="#2185d0" size={22} />,
  },
  'Update Brush': {
    backboneGlyph: <ChangeBrush size={22} />,
    currentGlyph: <ChangeBrush fill="#2185d0" size={22} />,
    regularGlyph: <ChangeBrush size={16} />,
    bundleGlyph: <ChangeBrush fill="#2185d0" size={22} />,
  },
  'Remove Brush': {
    backboneGlyph: <RemoveBrush size={22} />,
    currentGlyph: <RemoveBrush fill="#2185d0" size={22} />,
    regularGlyph: <RemoveBrush size={16} />,
    bundleGlyph: <RemoveBrush fill="#2185d0" size={22} />,
  },
  'Clear All': {
    backboneGlyph: <ClearAll size={22} />,
    currentGlyph: <ClearAll fill="#2185d0" size={22} />,
    regularGlyph: <ClearAll size={16} />,
    bundleGlyph: <ClearAll fill="#ccc" size={22} />,
  },
  'Change Brush Type': {
    backboneGlyph: <ChangeBrushType size={22} />,
    currentGlyph: <ChangeBrushType fill="#2185d0" size={22} />,
    regularGlyph: <ChangeBrushType size={16} />,
    bundleGlyph: <ChangeBrushType fill="#2185d0" size={22} />,
  },
  'Change Brush Size': {
    backboneGlyph: <ChangeBrushSize size={22} />,
    currentGlyph: <ChangeBrushSize fill="#2185d0" size={22} />,
    regularGlyph: <ChangeBrushSize size={16} />,
    bundleGlyph: <ChangeBrushSize fill="#2185d0" size={22} />,
  },
};

const App: FC = () => {
  const classes = useStyles();
  const { regularForceMark, matches, isnp, ipns } = useScatterplotStyle();
  const {
    exploreStore: {
      predictions,
      n_plots,
      addPlot,
      setMatchLegendVisibility,
      setPredictionSelection,
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

  const { bundledNodes } = useContext(Store);

  if (!loadedDataset) return <Redirect to="/project" />;

  const bundle: BundleMap = {};

  for (const j of bundledNodes) {
    if (j.length === 0) {
      continue;
    }
    bundle[j[0]] = {
      metadata: '',
      bundleLabel: '',
      bunchedNodes: j,
    };
  }

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Navbar />
      <div className={classes.layout}>
        <Visualization />
        <div style={{ overflow: 'scroll', padding: '1em' }}>
          <TableContainer component={Paper}>
            <Table style={{ tableLayout: 'auto' }}>
              <TableHead>
                <TableRow>
                  <TableCell width="30%">Intent</TableCell>
                  <TableCell width="60%">Rank</TableCell>
                  <TableCell width="10%" />
                </TableRow>
              </TableHead>
              <TableBody>
                {predictions.map((pred, i) => (
                  <TableRow
                    // TODO: Add a uid for prediction on backend and then use that
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    onMouseOut={() => {
                      setMatchLegendVisibility(false);
                      selectAll('.marks')
                        .classed(regularForceMark, false)
                        .classed(matches, false)
                        .classed(isnp, false)
                        .classed(ipns, false);
                    }}
                    onMouseOver={() => {
                      setMatchLegendVisibility(true);
                      const { matches: matchIds, isnp: isnpIds, ipns: ipnsIds } = pred.stats;
                      selectAll('.marks').classed(regularForceMark, true);

                      if (matchIds.length > 0)
                        selectAll(matchIds.map((m) => `#mark${m}`).join(',')).classed(
                          matches,
                          true,
                        );

                      if (isnpIds.length > 0)
                        selectAll(isnpIds.map((m) => `#mark${m}`).join(',')).classed(isnp, true);

                      if (ipnsIds.length > 0)
                        selectAll(ipnsIds.map((m) => `#mark${m}`).join(',')).classed(ipns, true);
                    }}
                  >
                    <Tooltip
                      title={
                        <>
                          <pre>
                            {JSON.stringify(
                              {
                                dimensions: pred.dimensions,
                                info: pred.info || '',
                              },
                              null,
                              2,
                            )}
                          </pre>
                        </>
                      }
                    >
                      <TableCell width="30%">{pred.intent}</TableCell>
                    </Tooltip>
                    <TableCell width="60%">{pred.rank}</TableCell>
                    <TableCell width="10%">
                      <IconButton onClick={() => setPredictionSelection(pred)}>
                        <TouchAppIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>
        <ProvVis
          bundleMap={bundle}
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

export default observer(App);
