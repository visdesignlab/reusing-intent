/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Input,
  InputLabel,
  Snackbar,
  TextField,
} from '@material-ui/core';
import Axios from 'axios';
import { observer } from 'mobx-react';
import React, { FC, useCallback, useContext, useState } from 'react';

import { SERVER } from '../../consts';
import Store from '../../Store/Store';

type Props = {
  open: boolean;
  handleClose: () => void;
};

const UploadDatasetDialog: FC<Props> = ({ open, handleClose }: Props) => {
  const { currentProject } = useContext(Store).projectStore;
  const [version, setVersion] = useState('v1');
  const [desc, setDesc] = useState('This is the original dataset');
  const [csv, setCsv] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<File | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [message, setMessage] = useState('');

  const uploadDataset = useCallback(() => {
    if (!csv || !currentProject) return;
    const formdata = new FormData();

    formdata.append('version', version);

    if (desc) formdata.append('description', desc);
    formdata.append('dataset', csv);

    if (metadata) formdata.append('metadata', metadata);

    Axios.post(`${SERVER}/${currentProject.key}/dataset/`, formdata, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
      .then((response) => {
        setMessage(response.data.message);
      })
      .catch((err) => {
        setMessage(err.response.data.description);
      })
      .finally(() => {
        setOpenSnackbar(true);
        setVersion('');
        setDesc('');
        setCsv(null);
        setMetadata(null);
      });
  }, [csv, currentProject, desc, metadata, version]);

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Upload a new dataset</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter an unique version number and a description for the dataset.
          </DialogContentText>
          <TextField
            id="dataset-version-id"
            label="Version"
            margin="dense"
            type="text"
            value={version}
            required
            onChange={(event) => setVersion(event.target.value)}
          />
          <br />
          <TextField
            id="dataet-desc"
            label="Description"
            margin="dense"
            type="text"
            value={desc}
            multiline
            onChange={(event) => setDesc(event.target.value)}
          />
          <br />
          <br />
          <>
            <InputLabel>
              <Input
                id="csv"
                type="file"
                hidden
                required
                onChange={(e: any) => setCsv(e.target.files[0])}
              />
              Dataset*
            </InputLabel>
          </>
          <br />
          <>
            <InputLabel>
              <Input
                id="metadata"
                type="file"
                hidden
                onChange={(e: any) => setMetadata(e.target.files[0])}
              />
              Metadata
            </InputLabel>
          </>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose()}>Cancel</Button>
          <Button
            disabled={version === '' || !csv}
            onClick={() => {
              uploadDataset();
              handleClose();
            }}
          >
            Add
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        autoHideDuration={2000}
        message={message}
        open={openSnackbar}
        onClose={() => setOpenSnackbar(false)}
      />
    </>
  );
};

export default observer(UploadDatasetDialog);
