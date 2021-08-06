import { Box, Button, IconButton, InputAdornment, TextField } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import VisibilityIcon from '@material-ui/icons/Visibility';
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import { observer } from 'mobx-react';
import { useContext, useState } from 'react';

import { GlobalPlotAttributeContext } from '../../contexts/CategoryContext';
import { useStore } from '../../stores/RootStore';
import { getSelections } from '../../stores/ViewState';

import AggregateDialog from './AggregateDialog';

const AggregationPanel = () => {
  const {
    exploreStore: { state, handleAggregate, hideAggregateMembers, toggleHideAggregateMembers },
  } = useStore();

  const [showAggregateDialog, setShowAggregateDialog] = useState(false);

  const { aggregateOptions } = useContext(GlobalPlotAttributeContext) || {};

  const isSelectionEmpty = getSelections(state).length === 0;

  const [aggLabel, setAggLabel] = useState('');
  const [showAggLabel, setShowAggLabel] = useState(true);

  return (
    <Box m={1}>
      <Button
        color="primary"
        variant="outlined"
        onClick={() => {
          if (aggregateOptions === null) {
            setShowAggregateDialog(true);
          } else {
            setShowAggLabel(!showAggLabel);
          }
        }}
      >
        Aggregate
      </Button>
      <IconButton size="medium" onClick={() => toggleHideAggregateMembers()}>
        {hideAggregateMembers ? <VisibilityOffIcon /> : <VisibilityIcon />}
      </IconButton>
      <AggregateDialog
        open={showAggregateDialog}
        onClose={() => setShowAggregateDialog(false)}
        onSet={() => {
          setShowAggLabel(true);
        }}
      />
      {showAggLabel && (
        <TextField
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  color="primary"
                  disabled={aggLabel.length === 0 || isSelectionEmpty}
                  size="small"
                  onClick={() => {
                    if (aggregateOptions) {
                      handleAggregate(aggLabel, aggregateOptions);
                      setAggLabel('');
                      setShowAggLabel(false);
                    }
                  }}
                >
                  <CheckIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          value={aggLabel}
          onChange={(e) => setAggLabel(e.target.value)}
        />
      )}
    </Box>
  );
};

export default observer(AggregationPanel);
