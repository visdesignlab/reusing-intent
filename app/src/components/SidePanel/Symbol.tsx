import { Button, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react';
import { FC } from 'react';

import { useStore } from '../../stores/RootStore';
import translate from '../../utils/transform';

const useStyles = makeStyles({
  root: {
    display: 'flex',
  },
});

type Props = {
  disabled?: boolean;
  label: string;
  path: string | null;
  onClick?: () => void;
};

const Symbol: FC<Props> = ({ disabled = false, path, label, onClick }) => {
  const styles = useStyles();
  const {
    exploreStore: { setHighlightMode, setHighlightPredicate },
  } = useStore();

  return (
    <div className={styles.root}>
      <Button
        disabled={disabled}
        startIcon={
          <svg height="25" viewBox="0 0 25 25" width="25">
            {path && <path d={path} opacity="0.5" transform={translate(25 / 2)} />}
          </svg>
        }
        onClick={() => {
          if (onClick) onClick();
        }}
        onMouseEnter={() => {
          setHighlightMode(true);
          setHighlightPredicate((p) => p.category === label);
        }}
        onMouseLeave={() => {
          setHighlightMode(false);
          setHighlightPredicate(null);
        }}
      >
        {label}
      </Button>
    </div>
  );
};

export default observer(Symbol);
