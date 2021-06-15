import { createStyles, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react';

import Sidebar from '../components/Sidebar';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      display: 'flex',
    },
  }),
);

const Projects = () => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <Sidebar />
    </div>
  );
};

export default observer(Projects);
