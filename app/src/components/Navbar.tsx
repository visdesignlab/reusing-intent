import {
  AppBar,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  makeStyles,
  Switch,
  Theme,
  Toolbar,
  Button,
} from '@material-ui/core';
import { Link } from 'react-router-dom';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { observer } from 'mobx-react';
import React, { FC, useContext, useMemo } from 'react';

import Store from '../Store/Store';

import AddPlot from './AddPlotComponent/AddPlot';
import useDropdown from './Dropdown';

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
  const store = useContext(Store);

  const {
    loadedDataset: dataset,
    state: { showCategories, categoryColumn },
    toggleCategories,
    changeCategory,
  } = store.exploreStore;

  const { categoricalColumns = [], columnInfo } = dataset || {};

  const {
    currentProject,
    comparisonDatasetKey,

    loadComparisonApply,
  } = useContext(Store).projectStore;

  const datasetOptions = useMemo(() => {
    const opts =
      currentProject?.datasets.map((dataset) => ({
        key: dataset.key,
        desc: dataset.version,
      })) || [];

    return opts;
  }, [currentProject]);

  const { Dropdown: CategoryDropdown } = useDropdown(
    'category-dropdown',
    'Category Column',
    '',
    categoricalColumns.map((col) => ({
      key: col,
      desc: `${columnInfo[col].fullname}`,
    })),
    categoryColumn,
    changeCategory,
  );

  const { Dropdown: ComparisonDropdown } = useDropdown(
    'dataset-dropdown',
    'Comparison Dataset',
    '',
    datasetOptions,
    comparisonDatasetKey || '',
    loadComparisonApply,
  );

  return (
    <div>
      <AppBar color="transparent" position="static">
        <Toolbar>
          <FormGroup row>
            <AddPlot />
            <Divider orientation="vertical" flexItem />
            <FormControlLabel
              className={classes.formControlwoWidth}
              control={
                <Switch
                  checked={showCategories}
                  color="primary"
                  onChange={() => toggleCategories(!showCategories, categoricalColumns)}
                />
              }
              label="Show Categories"
            />
            {showCategories && <CategoryDropdown />}
            <Divider orientation="vertical" flexItem />
            <FormControl className={classes.formControl}>
              <ToggleButtonGroup>
                <ToggleButton>
                  <CheckBoxOutlineBlankIcon />
                </ToggleButton>
                <ToggleButton>20</ToggleButton>
                <ToggleButton>35</ToggleButton>
                <ToggleButton>50</ToggleButton>
              </ToggleButtonGroup>
            </FormControl>
          </FormGroup>
          <Button color="primary" component={Link} to="/compare" variant="outlined">
            Apply
          </Button>
          <ComparisonDropdown/>
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
