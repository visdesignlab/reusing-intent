import { AppBar, Button, createStyles, makeStyles, Toolbar, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import LaunchIcon from '@material-ui/icons/Launch';
import { observer } from 'mobx-react';
import React, { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import Store from '../../Store/Store';
import useDropdown from '../Dropdown';

import DatasetTable from './DatasetTable';
import UploadDatasetDialog from './UploadDatasetDialog';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      flexGrow: 1,
      display: 'grid',
      height: '100vh',
      gridTemplateRows: 'min-content 1fr',
    },
  }),
);

const ProjectView = () => {
  const classes = useStyles();
  const { currentProject, loadedDatasetKey, loadDataset } = useContext(Store).projectStore;

  const [openUploadDatasetDialog, setOpenUploadDatasetDialog] = useState(false);

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

  if (!currentProject) return <div>Unloaded</div>;

  return (
    <div className={classes.root}>
      <AppBar color="transparent" position="static">
        <Toolbar>
          <Typography variant="h6" noWrap>
            {currentProject.name}
          </Typography>
          <DatasetDropdown />
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
        </Toolbar>
      </AppBar>
      <DatasetTable />
      <UploadDatasetDialog
        handleClose={() => setOpenUploadDatasetDialog(false)}
        open={openUploadDatasetDialog}
      />
    </div>
  );
};

export default observer(ProjectView);
