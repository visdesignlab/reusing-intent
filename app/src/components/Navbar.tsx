import {
  AppBar,
  Divider,
  FormControlLabel,
  makeStyles,
  Switch,
  Theme,
  Toolbar,
} from '@material-ui/core';
import { observer } from 'mobx-react';
import React, { FC, useContext } from 'react';

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

const Navbar: FC<{ style: any }> = ({ style }) => {
  const classes = useStyles();
  const store = useContext(Store);

  const {
    dataset,
    showCategories,
    toggleCategories,
    categoryColumn,
    changeCategory,
  } = store.exploreStore;

  const { categoricalColumns = [], columnInfo } = dataset || {};

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

  return (
    <div style={style}>
      <AppBar color="transparent" position="static">
        <Toolbar>
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
        </Toolbar>
      </AppBar>
    </div>
  );
};

(Navbar as any).whyDidYouRender = {
  logOnDifferentValues: true,
};
export default observer(Navbar);
