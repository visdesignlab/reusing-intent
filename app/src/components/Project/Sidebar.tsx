import {
  createStyles,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import AddBoxIcon from '@material-ui/icons/AddBox';
import FolderIcon from '@material-ui/icons/Folder';
import { observer } from 'mobx-react';
import React, { useContext, useState } from 'react';

import Store from '../../Store/Store';

import AddProjectDialog from './AddProjectDialog';

const drawerWidth = 240;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appBar: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    // necessary for content to be below app bar
    toolbar: {
      ...theme.mixins.toolbar,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }),
);

const Sidebar = () => {
  const classes = useStyles();
  const { projects, currentProject, selectProject } = useContext(Store).projectStore;

  const [open, setOpen] = useState(false);

  return (
    <Drawer
      className={classes.drawer}
      classes={{
        paper: classes.drawerPaper,
      }}
      variant="permanent"
    >
      <div className={classes.toolbar}>
        <Typography variant="h6">Projects</Typography>
      </div>
      <Divider />
      <List>
        <ListItem button onClick={() => setOpen(true)}>
          <ListItemIcon>
            <AddBoxIcon />
          </ListItemIcon>
          <ListItemText primary="Add Project"> </ListItemText>
        </ListItem>
      </List>
      <Divider />
      <List>
        {projects.map((proj) => (
          <ListItem
            key={proj.key}
            selected={proj.key === currentProject?.key}
            button
            onClick={() => selectProject(proj.key)}
          >
            <ListItemIcon>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText primary={proj.name} />
          </ListItem>
        ))}
      </List>
      <AddProjectDialog handleClose={() => setOpen(false)} open={open} />
    </Drawer>
  );
};

export default observer(Sidebar);
