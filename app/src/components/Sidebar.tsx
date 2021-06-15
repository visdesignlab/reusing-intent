import { gql, useQuery } from '@apollo/client';
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
import FolderIcon from '@material-ui/icons/Folder';
import { observer } from 'mobx-react';

import { useStore } from '../stores/RootStore';
import { ProjectResult } from '../stores/types/Project';

const drawerWidth = 240;
const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    appbar: {
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

const FEED_QUERY = gql`
  query {
    projects {
      success
      errors
      projects {
        id
        name
        datasets {
          id
          version
          project_id
        }
      }
    }
  }
`;

const Sidebar = () => {
  const styles = useStyles();

  const {
    projectStore: { setCurrentProject, project },
  } = useStore();
  const { data, loading } = useQuery<ProjectResult>(FEED_QUERY);

  if (loading) return <div>Loading</div>;

  if (!data) return <div>Something went wrong</div>;

  const { projects } = data.projects;

  if (!projects) return <div>Something went wrong</div>;

  return (
    <Drawer
      className={styles.drawer}
      classes={{
        paper: styles.drawerPaper,
      }}
      variant="permanent"
    >
      <div className={styles.toolbar}>
        <Typography variant="h4">Projects</Typography>
      </div>
      <Divider />
      <List>
        {projects.map((p) => (
          <ListItem
            key={p.id}
            selected={project !== null && project.id === p.id}
            button
            onClick={() => setCurrentProject(p)}
          >
            <ListItemIcon>
              <FolderIcon />
            </ListItemIcon>
            <ListItemText>{p.name}</ListItemText>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default observer(Sidebar);
