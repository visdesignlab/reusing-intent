import { Button, IconButton } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';
import { observer } from 'mobx-react';
import React, { FC, useContext, useReducer, useState } from 'react';

import { Plot } from '../../Store/IntentState';
import IntentStore from '../../Store/Store';
import { getPlotId } from '../../Utils/IDGens';
import Dropdown from '../Dropdown';

type addPlotReducerActions = {
  type: 'X' | 'Y';
  payload: string;
};

function addPlotReducer(plot: Plot, action: addPlotReducerActions) {
  switch (action.type) {
    case 'X':
      plot.x = action.payload;

      return plot;
    case 'Y':
      plot.y = action.payload;

      return plot;
    default:
      return plot;
  }
}

const AddPlot: FC = () => {
  const [isAdding, setIsAdding] = useState(true);
  const { data } = useContext(IntentStore);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [plot, dispatch] = useReducer(addPlotReducer, {
    id: getPlotId(),
    x: '',
    y: '',
    brushes: {},
    selectedPoints: [],
  });

  const setX = (payload: string) => dispatch({ type: 'X', payload });
  const setY = (payload: string) => dispatch({ type: 'Y', payload });

  const addButton = (
    <Button
      color="primary"
      startIcon={<AddIcon />}
      variant="contained"
      onClick={() => {
        setIsAdding(true);
      }}
    >
      Add Plot
    </Button>
  );

  const columns =
    data?.numericColumns.map((col) => ({
      key: col,
      desc: `${data?.columns[col].fullname || ''} (${data?.columns[col].unit || ''})`,
    })) || [];

  const plotMenu = (
    <>
      <Dropdown label="x-axis-dropdown" text="X Axis" values={columns} onChange={setX} />
      <Dropdown label="y-axis-dropdown" text="Y Axis" values={columns} onChange={setY} />
      <IconButton color="primary">
        <DoneIcon />
      </IconButton>
      <IconButton color="secondary" onClick={() => setIsAdding(false)}>
        <CloseIcon />
      </IconButton>
    </>
  );

  return !isAdding ? addButton : plotMenu;
};

export default observer(AddPlot);
