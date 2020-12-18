import {
  AppBar,
  Divider,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
  Toolbar,
} from '@material-ui/core';
import Axios from 'axios';
import { observer } from 'mobx-react';
import React, { FC, useContext, useEffect, useRef, useState } from 'react';

import IntentStore from '../Store/Store';

import AddPlot from './AddPlotComponent/AddPlot';

const useStyles = makeStyles((theme: Theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
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
  const { data } = useFetch('http://127.0.0.1:5000/datasets');
  const { dataset, datasets, setDataset, setDatasets } = intentStore;

  useEffect(() => {
    if (datasets.length === 0) setDatasets(data);
  }, [data, datasets, setDatasets]);

  const handleDatasetChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setDataset(event.target.value as string);
  };

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
              value={dataset || ''}
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
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default observer(Navbar);
