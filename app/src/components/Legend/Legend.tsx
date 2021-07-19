import { makeStyles } from '@material-ui/core';
import { symbol } from 'd3';
import { observer } from 'mobx-react';
import { FC, ReactNode } from 'react';

import translate from '../../utils/transform';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
  },
});

type Props = {
  items: { [key: string]: ReactNode };
};

const Legend: FC<Props> = ({ items }) => {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      {Object.entries(items).map(([name, sym]: [any, any]) => {
        return (
          <div key={name}>
            <svg height={10} width={10}>
              <path d={symbol(sym).size(80)() || ''} opacity="0.5" transform={translate(5)} />
            </svg>
            <div>{name}</div>
          </div>
        );
      })}
    </div>
  );
};

export default observer(Legend);
