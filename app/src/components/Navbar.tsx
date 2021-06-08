/* eslint-disable no-console */
import {
  AppBar,
  Button,
  Divider,
  FormControl,
  makeStyles,
  Theme,
  Toolbar,
  Dialog,
  DialogContent,
  TextField,
  DialogActions,
} from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { observer } from 'mobx-react';
import React, { FC, useContext, useState } from 'react';

import Store from '../Store/Store';

import AddPlot from './AddPlotComponent/AddPlot';

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  formControlwoWidth: {
    margin: theme.spacing(1),
  },
}));

const Navbar: FC = () => {
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [labelName, setLabelName] = useState("");

  const {
    exploreStore: { brushType, switchBrush, filter, aggregate, label },
  } = useContext(Store);

  return (
    <div>
      <AppBar color="transparent" position="static">
        <Toolbar>
          <AddPlot />
          <Divider orientation="vertical" flexItem />
          <FormControl className={classes.formControl}>
            <ToggleButtonGroup
              value={brushType}
              exclusive
              onChange={(_, bt) => {
                switchBrush(bt);
              }}
            >
              <ToggleButton value="Rectangular">
                <CheckBoxOutlineBlankIcon />
              </ToggleButton>
              <ToggleButton value="Freeform Small">
                <RadioButtonUncheckedIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="Freeform Medium">
                <RadioButtonUncheckedIcon />
              </ToggleButton>
              <ToggleButton value="Freeform Large">
                <RadioButtonUncheckedIcon fontSize="large" />
              </ToggleButton>
            </ToggleButtonGroup>
          </FormControl>
          <Divider />
          {/* <ComparisonDropdown /> */}
          <Button
            color="primary"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            variant="outlined"
            onClick={() => {
              filter('Out');
            }}
          >
            Filter Out
          </Button>

          <Button
            color="primary"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            variant="outlined"
            onClick={() => {
              // loadComparisonFilter("demo")
              filter('In');
            }}
          >
            Filter In
          </Button>
          <Button
            color="primary"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            variant="outlined"
            onClick={() => {
              aggregate();
            }}
          >
            Aggregate
          </Button>

          <Button
            color="primary"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            variant="outlined"
            onClick={() => {
              // loadComparisonFilter("demo")
              setOpen(true);
            }}
          >
            Label Nodes
          </Button>

          {/* <Button
            color="primary"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            variant="outlined"
            onClick={() => {
              // loadComparisonFilter("demo")
              storeProvenance(provenance.graph, workflows, provDb, currentProject?.key || 'Empty');
            }}
          >
            Store prov
          </Button> */}

          {/* <Button
            color="primary"
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            variant="outlined"
            onClick={() => {
              setOpen(true);
            }}
          >
            Bundle
          </Button> */}

          <Dialog aria-labelledby="form-dialog-title" open={open} onClose={() => setOpen(false)}>
            <DialogContent>
              <TextField
                autoComplete="off"
                id="name"
                label="Aggregate Name"
                margin="dense"
                type="email"
                autoFocus
                fullWidth
                onChange={(e) => setLabelName(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button color="primary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                color="primary"
                onClick={() => {
                  label(labelName);
                  setOpen(false);
                }}
              >
                Add Label to Nodes
              </Button>
            </DialogActions>
          </Dialog>
        </Toolbar>
      </AppBar>
    </div>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(Navbar as any).whyDidYouRender = {
  logOnDifferentValues: true,
};
export default observer(Navbar);
