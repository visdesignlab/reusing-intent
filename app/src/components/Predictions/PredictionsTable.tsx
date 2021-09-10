import {
  CircularProgress,
  createStyles,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  makeStyles,
  Tooltip,
  Typography,
} from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import TouchAppIcon from '@material-ui/icons/TouchApp';
import { observer } from 'mobx-react';

import { useStore } from '../../stores/RootStore';
import { predictionToIntent } from '../../types/Prediction';
import useScatterplotStyle from '../Scatterplot/styles';

import Bar from './Bar';

const useStyles = makeStyles(() =>
  createStyles({
    centerContainer: {
      height: '100%',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
    },
    listContainer: {
      overflow: 'scroll',
      padding: '1em',
    },
  }),
);

const PredictionsTable = () => {
  const classes = useStyles();
  const spStyles = useScatterplotStyle();
  const {
    exploreStore: {
      predictions: { isLoading, values },
      setHighlightMode,
      setHoveredPrediction,
      setHighlightPredicate,
      setColorPredicate,
      handleIntentSelection,
      setShowMatchesLegend,
    },
  } = useStore();

  if (isLoading)
    return (
      <div className={classes.centerContainer}>
        <CircularProgress />
        <Typography variant="button">Computing Predictions</Typography>
      </div>
    );

  if (values.length === 0)
    return (
      <div className={classes.centerContainer}>
        <Typography variant="button">No valid selections</Typography>
      </div>
    );

  return (
    <div className={classes.listContainer}>
      <List>
        {values.map((pred) => (
          <ListItem
            key={pred.hash}
            onMouseEnter={() => {
              setHoveredPrediction(pred);
              setHighlightMode(true);
              setHighlightPredicate((point) => {
                const {
                  membership_stats: { ipns, isnp, matches },
                } = pred;

                return (
                  ipns.includes(point.id) || isnp.includes(point.id) || matches.includes(point.id)
                );
              });
              setColorPredicate(({ id }) => {
                const {
                  membership_stats: { ipns, isnp, matches },
                } = pred;

                if (ipns.includes(id)) return spStyles.ipns;

                if (isnp.includes(id)) return spStyles.isnp;

                if (matches.includes(id)) return spStyles.matches;

                return 'inherit';
              });
              setShowMatchesLegend(true);
            }}
            onMouseLeave={() => {
              setHoveredPrediction(null);
              setHighlightMode(false);
              setHighlightPredicate(null);
              setColorPredicate(null);
              setShowMatchesLegend(false);
            }}
          >
            <Bar
              label={`${pred.intent} ( ${pred.rank_jaccard.toFixed(3)} )`}
              rank={pred.rank_jaccard}
            />
            <ListItemIcon>
              <IconButton
                onClick={() => {
                  handleIntentSelection(pred);
                  setHighlightMode(false);
                  setHighlightPredicate(null);
                  setColorPredicate(null);
                  setShowMatchesLegend(false);
                }}
              >
                <TouchAppIcon />
              </IconButton>
            </ListItemIcon>
            <Tooltip title={<pre>{JSON.stringify(predictionToIntent(pred), null, 2)}</pre>}>
              <ListItemIcon>
                <InfoIcon />
              </ListItemIcon>
            </Tooltip>
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default observer(PredictionsTable);
