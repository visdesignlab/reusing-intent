import {
  AppBar,
  Button,
  createStyles,
  makeStyles,
  Switch,
  Toolbar,
  Typography,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import LaunchIcon from '@material-ui/icons/Launch';
import { observer } from 'mobx-react';
import React, { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Store from '../../Store/Store';
import useDropdown from '../Dropdown';

import { ComparisonTable, DatasetTable } from './DatasetTable';
import UploadDatasetDialog from './UploadDatasetDialog';

const useStyles = makeStyles(() =>
  createStyles({
    colorClass: {},
    root: {
      '& .red': {
        background: '#ff8080',
      },
      '& .green': {
        backgroundColor: '#90EE90',
      },
      '& .yellow': {
        backgroundColor: '#ffff8b',
      },
      flexGrow: 1,
      display: 'grid',
      height: '100vh',
      gridTemplateRows: 'min-content 1fr',
      gridTemplateColumns: '2fr 2fr',
    },
  }),
);

const ProjectView = () => {
  const classes = useStyles();
  const {
    currentProject,
    comparisonDatasetKey,
    loadedDatasetKey,
    loadDataset,
    loadComparisonDataset,
  } = useContext(Store).projectStore;

  const [openUploadDatasetDialog, setOpenUploadDatasetDialog] = useState(false);
  const [comparisonView, setComparisonView] = useState(false);

  const datasetOptions = useMemo(() => {
    const opts =
      currentProject?.datasets.map((dataset) => ({
        key: dataset.key,
        desc: dataset.version,
      })) || [];

    return opts;
  }, [currentProject]);

  const { Dropdown: DatasetDropdown } = useDropdown(
    'dataset-dropdown',
    'Dataset',
    '',
    datasetOptions,
    loadedDatasetKey || '',
    loadDataset,
  );

  const { Dropdown: ComparisonDropdown } = useDropdown(
    'dataset-dropdown',
    'Comparison Dataset',
    '',
    datasetOptions,
    comparisonDatasetKey || '',
    loadComparisonDataset,
  );

  if (!currentProject) return <div>Unloaded</div>;

  return (
    <div className={classes.root}>
      <AppBar
        color="transparent"
        position="static"
        style={{ gridColumnStart: 1, gridColumnEnd: 3 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap>
            {currentProject.name}
          </Typography>
          <DatasetDropdown />
          {comparisonView ? <ComparisonDropdown /> : null}
          <Button
            color="primary"
            startIcon={<AddIcon />}
            variant="outlined"
            onClick={() => setOpenUploadDatasetDialog(true)}
          >
            Upload Dataset
          </Button>
          <Button
            color="primary"
            component={Link}
            startIcon={<LaunchIcon />}
            to="/explore"
            variant="outlined"
          >
            Load Dataset
          </Button>
          <Switch
            checked={comparisonView}
            color="primary"
            inputProps={{ 'aria-label': 'secondary checkbox' }}
            name="checkedA"
            onChange={() => {
              setComparisonView(!comparisonView);
            }}
          />
        </Toolbar>
      </AppBar>
      <DatasetTable columnNum={comparisonView ? 1 : 2} />
      {comparisonView && <ComparisonTable />}
      <UploadDatasetDialog
        handleClose={() => setOpenUploadDatasetDialog(false)}
        open={openUploadDatasetDialog}
      />
    </div>
  );
};

export default observer(ProjectView);
