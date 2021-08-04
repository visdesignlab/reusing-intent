import { createStyles, makeStyles, Theme } from '@material-ui/core';
import clsx from 'clsx';
import { observer } from 'mobx-react';
import { FC } from 'react';

import BrushSelector from './BrushSelector';
import CategoriesCard from './CategoriesCard';
import Transformations from './Transformations';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      flexFlow: 'column',
      gap: theme.spacing(1),
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
      <BrushSelector />
      <Transformations />
      <CategoriesCard />
    </div>
  );
};

export default observer(SidePanel);
