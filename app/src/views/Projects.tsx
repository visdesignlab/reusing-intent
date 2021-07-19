import { gql, useQuery } from '@apollo/client';
import { createStyles, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react';

import DataView from '../components/DataView';
import Sidebar from '../components/Sidebar';
import If from '../components/utils/If';
import { useStore } from '../stores/RootStore';
import { ProjectResult } from '../stores/types/Project';

const PROJECTS_QUERY = gql`
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

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: 'flex',
    },
    project: {
      height: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
    },
  }),
);

const Projects = () => {
  const styles = useStyles();

  const {
    projectStore: { project, dataset_id },
  } = useStore();

  const { data, loading } = useQuery<ProjectResult>(PROJECTS_QUERY);

  if (loading) return <div>Loading Projects</div>;

  if (!data) return <div>Projects not available.</div>;

  const { success, errors, projects } = data.projects;

  if (!success) throw new Error(errors[0]);

  return (
    <div className={styles.root}>
      <Sidebar projects={projects} />
      <If condition={Boolean(project && dataset_id)}>
        <DataView />
      </If>
    </div>
  );
};

export default observer(Projects);
