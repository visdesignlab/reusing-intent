import { Box, Button, IconButton, InputAdornment, Switch, TextField } from '@material-ui/core';
import CheckIcon from '@material-ui/icons/Check';
import { observer } from 'mobx-react';
import { useContext, useState } from 'react';

import { GlobalPlotAttributeContext } from '../../contexts/CategoryContext';
import { CUSTOM_LABEL } from '../../stores/ExploreStore';
import { useStore } from '../../stores/RootStore';
import { getSelections } from '../../stores/ViewState';
import translate from '../../utils/transform';

const Labels = () => {
  const {
    exploreStore: {
      showLabelLayer,
      toggleLabelLayer,
      handleLabelling,
      state,
      setHighlightMode,
      setHighlightPredicate,
    },
  } = useStore();

  const { labelMap = {} } = useContext(GlobalPlotAttributeContext) || {};

  const [label, setLabel] = useState('');
  const [showLabel, setShowLabel] = useState(true);

  const isSelectionEmpty = getSelections(state).length === 0;

  return (
    <Box m={1}>
      <Button
        color="primary"
        variant="outlined"
        onClick={() => {
          if (!showLabel) toggleLabelLayer(true);
          setShowLabel(!showLabel);
          setLabel('');
        }}
      >
        Label
      </Button>
      <Switch
        checked={showLabelLayer}
        color="primary"
        size="small"
        onChange={() => toggleLabelLayer()}
      />
      {showLabel && (
        <TextField
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  color="primary"
                  disabled={label.length === 0 || isSelectionEmpty}
                  size="small"
                  onClick={() => {
                    handleLabelling(label);
                    setLabel('');
                    setShowLabel(false);
                  }}
                >
                  <CheckIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
      )}
      <div>
        {showLabelLayer &&
          Object.entries(labelMap).map(([label, color]) => {
            return (
              <div key={label}>
                <Button
                  startIcon={
                    <svg key={label} height="25" viewBox="0 0 25 25" width="25">
                      <circle className={color} r="5" transform={translate(12.5)} />
                    </svg>
                  }
                  disableFocusRipple
                  disableRipple
                  onMouseEnter={() => {
                    setHighlightMode(true);
                    setHighlightPredicate((p) => (p[CUSTOM_LABEL] || []).includes(label));
                  }}
                  onMouseLeave={() => {
                    setHighlightMode(false);
                    setHighlightPredicate(null);
                  }}
                >
                  {label}
                </Button>
              </div>
            );
          })}
      </div>
    </Box>
  );
};

export default observer(Labels);
