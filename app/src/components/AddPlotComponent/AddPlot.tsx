import {
  Button,
  ButtonGroup,
  createStyles,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Theme,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import CloseIcon from '@material-ui/icons/Close';
import DoneIcon from '@material-ui/icons/Done';
import { observer } from 'mobx-react';
import React, { FC, useCallback, useContext, useState } from 'react';

import Store from '../../Store/Store';
import { Plot } from '../../Store/Types/Plot';
import { getPlotId } from '../../Utils/IDGens';
import useDropdown from '../Dropdown';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    divSpacing: {
      margin: theme.spacing(1),
    },
    center: {
      justifyContent: 'center',
    },
  }),
);

const AddPlot: FC = () => {
  const classes = useStyles();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const { loadedDataset: dataset, addPlot } = useContext(Store).exploreStore;

  const columns =
    dataset?.numericColumns.map((col) => ({
      key: col,
      desc: `${dataset?.columnInfo[col].fullname || ''} (${dataset?.columnInfo[col].unit || ''})`,
    })) || [];

  const { selected: xCol, Dropdown: XDropdown, setSelected: setX } = useDropdown(
    'x-axis-dropdown',
    'X Axis',
    '',
    columns,
  );
  const { selected: yCol, Dropdown: YDropdown, setSelected: setY } = useDropdown(
    'y-axis-dropdown',
    'Y Axis',
    '',
    columns,
  );

  const handleClose = useCallback(() => {
    setAnchor(null);
  }, []);

  const handleSubmit = useCallback(() => {
    const plot: Plot = {
      id: getPlotId(),
      x: xCol,
      y: yCol,
    };

    addPlot(plot);
    setX('');
    setY('');
    handleClose();
  }, [setX, setY, xCol, yCol, addPlot, handleClose]);

  return (
    <>
      <div className={classes.divSpacing}>
        <Button
          color="primary"
          startIcon={<AddIcon />}
          variant="contained"
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            setAnchor(event.currentTarget);
          }}
        >
          Add Plot
        </Button>
      </div>
      <Menu anchorEl={anchor} open={Boolean(anchor)} onClose={handleClose}>
        <MenuItem button={false}>
          <XDropdown />
        </MenuItem>
        <MenuItem button={false}>
          <YDropdown />
        </MenuItem>
        <MenuItem button={false} selected={false} divider />
        <MenuItem alignItems="center" button={false}>
          <ButtonGroup className={classes.center} fullWidth>
            <IconButton color="primary" disabled={!(xCol && yCol)} onClick={handleSubmit}>
              <DoneIcon />
            </IconButton>
            <IconButton
              color="secondary"
              onClick={() => {
                setX('');
                setY('');
                setAnchor(null);
              }}
            >
              <CloseIcon />
            </IconButton>
          </ButtonGroup>
        </MenuItem>
      </Menu>
    </>
  );
};

export default observer(AddPlot);
