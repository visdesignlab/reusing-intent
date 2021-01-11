/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  CssBaseline,
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
import { selectAll } from 'd3';
import { observer } from 'mobx-react';
import React, { FC, useContext, useEffect } from 'react';
import { Redirect } from 'react-router-dom';

import Navbar from './components/Navbar';
import useScatterplotStyle from './components/Scatterplot.tsx/styles';
import Visualization from './components/Visualization';
import { Plot } from './Store/Plot';
import Store from './Store/Store';
import { getPlotId } from './Utils/IDGens';

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
  const { regularForceMark, matches, isnp, ipns } = useScatterplotStyle();
  const {
    exploreStore: { predictions, n_plots, addPlot, setMatchLegendVisibility },
    projectStore: { loadedDataset },
  } = useContext(Store);

  useEffect(() => {
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

  if (!loadedDataset) return <Redirect to="/project" />;

  return (
    <div className={classes.root}>
      <CssBaseline />
      <Navbar style={{ widthh: 1 }} />
      <div className={classes.layout}>
        <Visualization />
        {predictions.length > 0 && (
          <div style={{ overflow: 'scroll', padding: '1em' }}>
            <TableContainer component={Paper}>
              <Table style={{ tableLayout: 'auto' }}>
                <TableHead>
                  <TableRow>
                    <TableCell width="30%">Intent</TableCell>
                    <TableCell width="70%">Rank</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {predictions.map((pred, i) => (
                    <TableRow
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
                          selectAll(matchIds.map((m: any) => `#mark${m}`).join(',')).classed(
                            matches,
                            true,
                          );

                        if (isnpIds.length > 0)
                          selectAll(isnpIds.map((m: any) => `#mark${m}`).join(',')).classed(
                            isnp,
                            true,
                          );

                        if (ipnsIds.length > 0)
                          selectAll(ipnsIds.map((m: any) => `#mark${m}`).join(',')).classed(
                            ipns,
                            true,
                          );
                      }}
                    >
                      <Tooltip title={JSON.stringify(pred.params, null, 2)}>
                        <TableCell width="30%">{pred.intent}</TableCell>
                      </Tooltip>
                      <TableCell width="70%">{pred.rank}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default observer(App);
