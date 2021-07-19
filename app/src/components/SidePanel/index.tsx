import { createStyles, makeStyles, Theme } from '@material-ui/core';
import clsx from 'clsx';
import { observer } from 'mobx-react';
import { FC } from 'react';

import CategoriesCard from './CategoriesCard';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      padding: theme.spacing(2),
    },
  }),
);

type Props = {
  classes?: string | string[];
};

const SidePanel: FC<Props> = ({ classes = [] }) => {
  const styles = useStyles();

  return (
    <div className={clsx(classes, styles.root)}>
      <CategoriesCard />
    </div>
  );
};

export default observer(SidePanel);
