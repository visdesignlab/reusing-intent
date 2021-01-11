import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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

const AddProjectDialog: FC<Props> = ({ open, handleClose }: Props) => {
  const { loadProjects } = useContext(Store).projectStore;
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const createProject = useCallback(() => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('reset', 'True');
    Axios.post(`${SERVER}/project/${id}`, formData)
      .then((response) => {
        const { message } = response.data;
        setMessage(message);
      })
      .catch(() => {
        setMessage('Something went wrong!');
      })
      .finally(() => {
        setId('');
        setName('');
        setOpenSnackbar(true);
        loadProjects(id);
      });
  }, [id, name, loadProjects]);

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Create new project</DialogTitle>
        <DialogContent>
          <DialogContentText>Please enter name and an unique id for the project.</DialogContentText>
          <TextField
            id="project-id"
            label="Project ID"
            margin="dense"
            type="text"
            value={id}
            required
            onChange={(event) => setId(event.target.value)}
          />
          <br />
          <TextField
            id="project-name"
            label="Project Name"
            margin="dense"
            type="text"
            value={name}
            required
            onChange={(event) => setName(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleClose()}>Cancel</Button>
          <Button
            disabled={id === '' || name === ''}
            onClick={() => {
              createProject();
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

export default observer(AddProjectDialog);
