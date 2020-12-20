import {
  AppBar,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Switch,
  Theme,
  Toolbar,
} from '@material-ui/core';
import Axios from 'axios';
import { observer } from 'mobx-react';
import React, { FC, useContext, useEffect, useRef, useState } from 'react';

import IntentStore from '../Store/Store';

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

type FetchStatus = 'Idle' | 'Fetching' | 'Fetched';

const useFetch = (url: string | null) => {
  // TODO: Implement the following at some point
  // https://www.smashingmagazine.com/2020/07/custom-react-hook-fetch-cache-data/
  const cache = useRef<{ [key: string]: string[] }>({});
  const [data, setData] = useState<string[]>([]);
  const [status, setStatus] = useState<FetchStatus>('Idle');

  useEffect(() => {
    if (!url) return;
    setStatus('Fetching');

    if (cache.current[url]) {
      const data = cache.current[url];
      setData(data);
      setStatus('Fetched');
    } else {
      Axios.get(url).then((res) => {
        cache.current[url] = res.data;
        setData(res.data);
        setStatus('Fetched');
      });
    }
  }, [url]);

  return { data, status };
};

const Navbar: FC = () => {
  const classes = useStyles();
  const intentStore = useContext(IntentStore);
  const { data: fetchedDatasets } = useFetch('http://127.0.0.1:5000/datasets');
  const {
    datasetName,
    datasets,
    dataset,
    showCategories,
    setDataset,
    setDatasets,
    toggleCategories,
    categoryColumn,
    changeCategory,
  } = intentStore;

  const { categoricalColumns = [], columns } = dataset || {};

  useEffect(() => {
    setDatasets(fetchedDatasets);
  }, [fetchedDatasets, setDatasets]);

  const handleDatasetChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setDataset(event.target.value as string);
  };

  const { Dropdown: CategoryDropdown } = useDropdown(
    'category-dropdown',
    'Select Category Column',
    '',
    categoricalColumns.map((col) => ({
      key: col,
      desc: `${columns[col].fullname}`,
    })),
    categoryColumn,
    changeCategory,
  );

  return (
    <div>
      <AppBar color="transparent" position="static">
        <Toolbar>
          <FormControl className={classes.formControl} variant="outlined">
            <InputLabel id="load-dataset-select-label">Dataset</InputLabel>
            <Select
              id="load-dataset-select"
              label="Dataset"
              labelId="load-dataset-select-label"
              value={datasetName || ''}
              onChange={handleDatasetChange}
            >
              {datasets.map((d) => (
                <MenuItem key={d} value={d}>
                  {d}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Divider orientation="vertical" flexItem />
          <AddPlot />
          <Divider orientation="vertical" flexItem />
          <FormControlLabel
            className={classes.formControlwoWidth}
            control={
              <Switch
                checked={showCategories}
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

export default observer(Navbar);
