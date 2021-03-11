import {
  AppBar,
  Button,
  Divider,
  FormControl,
  makeStyles,
  Theme,
  Toolbar,
} from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { observer } from 'mobx-react';
import React, { FC, useContext } from 'react';
import { Link } from 'react-router-dom';

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
  // const [open, setOpen] = useState(false);
  const store = useContext(Store);
  const { search } = store;

  const {
    exploreStore: { brushType, switchBrush, filter },
  } = useContext(Store);

  // const datasetOptions = useMemo(() => {
  //   const opts =
  //     currentProject?.datasets.map((dataset) => ({
  //       key: dataset.key,
  //       desc: dataset.version,
  //     })) || [];

  //   return opts;
  // }, [currentProject]);

  // const { Dropdown: ComparisonDropdown } = useDropdown(
  //   'dataset-dropdown',
  //   'Comparison Dataset',
  //   '',
  //   datasetOptions,
  //   comparisonDatasetKey || '',
  //   loadComparisonApply,
  // );

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
              <ToggleButton value="Freeform Small">20</ToggleButton>
              <ToggleButton value="Freeform Medium">35</ToggleButton>
              <ToggleButton value="Freeform Large">50</ToggleButton>
            </ToggleButtonGroup>
          </FormControl>
          <Divider />
          <Button
            color="primary"
            component={Link}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            to={{ pathname: '/compare', search } as any}
            variant="outlined"
          >
            Apply
          </Button>
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

          {/* <Dialog aria-labelledby="form-dialog-title" open={open} onClose={handleClose}>
            <DialogContent>
              <TextField
                id="name"
                label="Bundle Name"
                margin="dense"
                type="email"
                autoFocus
                fullWidth
                onChange={(e) => console.log(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button color="primary" onClick={handleClose}>
                Cancel
              </Button>
              <Button color="primary" onClick={handleClose}>
                Create Bundle
              </Button>
            </DialogActions>
          </Dialog> */}
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
