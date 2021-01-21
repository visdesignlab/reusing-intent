/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
  InputLabel,
  TextField,
} from '@material-ui/core';
import Axios, { AxiosResponse } from 'axios';
import { useFormik } from 'formik';
import { observer } from 'mobx-react';
import React, { ChangeEvent, FC, useCallback, useContext, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { SERVER } from '../../consts';
import { Project } from '../../Store/ProjectStore';
import Store from '../../Store/Store';

import StatusBars from './StatusBars';

type Props = {
  open: boolean;
  handleClose: () => void;
};

type DatasetFormFields = {
  version: string;
  description: string;
  dataset: File;
  metadata: File;
};

export type ID = {
  type: string;
  id: string;
};

type DatasetResponse = {
  datasetKey: string;
  message: string;
  trackers: ID[];
};

const queryClient = new QueryClient();

function useDatasetFormManagement(project: Project | null) {
  const [showStatus, setShowStatus] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [trackers, setTrackers] = useState<ID[]>([]);

  const updateWhenDone = useCallback(() => {
    setShowStatus(false);
    setProcessingComplete(true);
  }, []);

  const handleSubmit = useCallback(
    (fields: DatasetFormFields) => {
      if (!project) return;

      const formData = new FormData();

      Object.entries(fields).forEach((entry) => {
        formData.append(entry[0], entry[1]);
      });
      formData.append('reset', 'True');

      Axios.post(`${SERVER}/${project.key}/dataset/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }).then((response: AxiosResponse<DatasetResponse>) => {
        setTrackers(response.data.trackers);
        setShowStatus(true);
      });
    },
    [project],
  );
  const initialValues: DatasetFormFields = {
    version: '',
    description: '',
    dataset: null as never,
    metadata: null as never,
  };

  return { handleSubmit, initialValues, showStatus, trackers, updateWhenDone, processingComplete };
}

const UploadDatasetDialog: FC<Props> = ({ open, handleClose }: Props) => {
  const { currentProject } = useContext(Store).projectStore;
  const {
    initialValues,
    handleSubmit,
    showStatus,
    trackers,
    updateWhenDone,
    processingComplete,
  } = useDatasetFormManagement(currentProject);
  const formik = useFormik({
    initialValues,
    onSubmit: handleSubmit,
  });

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Upload a new dataset</DialogTitle>
        <DialogContent>
          <form id="dataset-form" onSubmit={formik.handleSubmit}>
            <TextField
              id="version"
              label="Version"
              margin="dense"
              type="text"
              value={formik.values.version}
              fullWidth
              required
              onChange={formik.handleChange}
            />
            <TextField
              id="description"
              label="Description"
              margin="dense"
              type="text"
              value={formik.values.description}
              fullWidth
              multiline
              onChange={formik.handleChange}
            />
            <InputLabel>
              <Input
                id="csv"
                type="file"
                hidden
                required
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const { files } = event.target;

                  if (files && files.length > 0) formik.setFieldValue('dataset', files[0]);
                }}
              />
              Dataset*
            </InputLabel>
            <InputLabel>
              <Input
                id="yaml"
                type="file"
                hidden
                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                  const { files } = event.target;

                  if (files && files.length > 0) formik.setFieldValue('metadata', files[0]);
                }}
              />
              Metadata
            </InputLabel>
          </form>
          {showStatus && (
            <QueryClientProvider client={queryClient}>
              <StatusBars trackers={trackers} updateWhenDone={updateWhenDone} />
            </QueryClientProvider>
          )}
        </DialogContent>
        <DialogActions>
          {processingComplete ? (
            <Button onClick={() => handleClose()}>Close</Button>
          ) : (
            <>
              <Button onClick={() => handleClose()}>Cancel</Button>
              <Button disabled={formik.isSubmitting} form="dataset-form" type="submit">
                Add
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default observer(UploadDatasetDialog);
