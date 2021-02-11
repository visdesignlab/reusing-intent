import {
  createStyles,
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
import { observer } from 'mobx-react';
import { useContext } from 'react';

import Store from '../../Store/Store';

export const useStyles = makeStyles(() => createStyles({}));

const PredictionTable = () => {
  // const classes = useStyles();

  const {
    exploreStore: { predictions, setPredictionSelection, setHoveredPrediction },
  } = useContext(Store);

  return (
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
            {predictions.map((pred) => (
              <TableRow key={pred.hash}>
                <Tooltip title={pred.description}>
                  <TableCell width="30%">{pred.intent}</TableCell>
                </Tooltip>
                <TableCell width="60%">{pred.rank}</TableCell>
                <TableCell
                  width="10%"
                  onMouseOut={() => {
                    setHoveredPrediction(null);
                  }}
                  onMouseOver={() => {
                    setHoveredPrediction(pred);
                  }}
                >
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
  );
};

export default observer(PredictionTable);
