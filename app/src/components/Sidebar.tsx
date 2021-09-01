import {
  createStyles,
  Divider,
  Drawer,
  IconButton,
  makeStyles,
  Theme,
  Typography,
} from '@material-ui/core';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import DescriptionIcon from '@material-ui/icons/Description';
import FolderIcon from '@material-ui/icons/Folder';
import LaunchIcon from '@material-ui/icons/Launch';
import { TreeItem, TreeView } from '@material-ui/lab';
import { observer } from 'mobx-react';
import { useHistory } from 'react-router-dom';

import { useStore } from '../stores/RootStore';
import { Projects } from '../stores/types/Project';

const useStyles = (drawerWidth: number) => {
  return makeStyles((theme: Theme) =>
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
  )();
};

type Props = {
  projects: Projects;
};

const Sidebar = ({ projects }: Props) => {
  const drawerWidth = 240;
  const styles = useStyles(drawerWidth);
  const {
    exploreStore: { changeCategoryColumn },
    projectStore: { setCurrentProject, setDatasetId, project, dataset_id },
  } = useStore();
  const history = useHistory();

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
      <TreeView
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultEndIcon={<div style={{ width: 24 }} />}
        defaultExpandIcon={<ArrowRightIcon />}
        expanded={project ? [project.id.toString()] : []}
        selected={dataset_id ? dataset_id : ''}
      >
        {projects.map((p) => {
          return (
            <StyledTreeItem
              key={p.id}
              labelIcon={FolderIcon}
              labelText={p.name}
              nodeId={p.id}
              onClick={() => {
                setCurrentProject(p.id);
                changeCategoryColumn(null);
              }}
            >
              {p.datasets.map((d) => {
                return (
                  <StyledTreeItem
                    key={d.id}
                    labelIcon={DescriptionIcon}
                    labelText={d.version}
                    launchHandler={() => {
                      history.push('/explore');
                    }}
                    nodeId={d.id}
                    showLaunch
                    onClick={() => setDatasetId(d.id)}
                  />
                );
              })}
            </StyledTreeItem>
          );
        })}
      </TreeView>
    </Drawer>
  );
};

export default observer(Sidebar);

const useTreeItemStyles = makeStyles((theme: Theme) => ({
  root: {
    color: theme.palette.text.secondary,
    '&:hover > $content': {
      backgroundColor: theme.palette.action.hover,
    },
    '&:focus > $content, &$selected > $content': {
      backgroundColor: `var(--tree-view-bg-color, ${theme.palette.grey[400]})`,
      color: 'var(--tree-view-color)',
    },
    '&:focus > $content $label, &:hover > $content $label, &$selected > $content $label': {
      backgroundColor: 'transparent',
    },
  },
  content: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    '$expanded > &': {
      fontWeight: theme.typography.fontWeightRegular,
    },
  },
  group: {
    marginLeft: 0,
    '& $content': {
      paddingLeft: theme.spacing(2),
    },
  },
  expanded: {},
  selected: {},
  label: {
    fontWeight: 'inherit',
    color: 'inherit',
  },
  labelRoot: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0.5, 0),
  },
  labelIcon: {
    marginRight: theme.spacing(1),
  },
  labelText: {
    fontWeight: 'inherit',
    flexGrow: 1,
  },
}));

type StyledTreeItemProps = {
  bgColor?: string;
  color?: string;
  labelInfo?: string;
  labelText?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  labelIcon: any;
  nodeId: string;
  showLaunch?: boolean;
  launchHandler?: (event: React.MouseEvent) => void;
  onClick?: () => void;
  [key: string]: unknown;
};

function StyledTreeItem(props: StyledTreeItemProps) {
  const classes = useTreeItemStyles();
  const {
    labelText,
    labelIcon: LabelIcon,
    labelInfo,
    color,
    bgColor,
    nodeId,
    onClick,
    showLaunch = false,
    launchHandler,
    ...other
  } = props;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const style: any = {
    '--tree-view-color': color,
    '--tree-view-bg-color': bgColor,
  };

  return (
    <TreeItem
      classes={{
        root: classes.root,
        content: classes.content,
        expanded: classes.expanded,
        selected: classes.selected,
        group: classes.group,
        label: classes.label,
      }}
      label={
        <div className={classes.labelRoot}>
          <LabelIcon className={classes.labelIcon} color="inherit" />
          <Typography className={classes.labelText} variant="body2">
            {labelText}
          </Typography>
          <Typography color="inherit" variant="caption">
            {labelInfo}
          </Typography>
          {showLaunch && (
            <IconButton
              size="small"
              onClick={(event) => {
                if (launchHandler) launchHandler(event);
              }}
            >
              <LaunchIcon />
            </IconButton>
          )}
        </div>
      }
      nodeId={nodeId}
      style={style}
      onClick={onClick}
      {...other}
    />
  );
}
