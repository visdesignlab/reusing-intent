import { Button, makeStyles } from '@material-ui/core';
import { observer } from 'mobx-react';
import { FC } from 'react';
import { ReactNode } from 'react-transition-group/node_modules/@types/react';

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
  path?: string | null;
  shape?: ReactNode | null;
  transform?: string;
  width?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

const Symbol: FC<Props> = ({
  disabled = false,
  path,
  shape,
  label,
  onClick,
  onMouseEnter,
  onMouseLeave,
  width = 25,
  transform = 'rotate(0)',
}) => {
  const styles = useStyles();
  const {
    exploreStore: { setHighlightMode, setHighlightPredicate },
  } = useStore();

  return (
    <div className={styles.root}>
      <Button
        disabled={disabled}
        startIcon={
          <svg height="25" viewBox="0 0 25 25" width={width}>
            {path && <path d={path} opacity="0.5" transform={`${translate(25 / 2)}${transform}`} />}
            {shape && shape}
          </svg>
        }
        onClick={() => {
          if (onClick) onClick();
        }}
        onMouseEnter={() => {
          if (onMouseEnter) {
            onMouseEnter();
          } else {
            setHighlightMode(true);
            setHighlightPredicate((p) => p.category === label);
          }
        }}
        onMouseLeave={() => {
          if (onMouseLeave) {
            onMouseLeave();
          } else {
            setHighlightMode(false);
            setHighlightPredicate(null);
          }
        }}
      >
        {label}
      </Button>
    </div>
  );
};

export default observer(Symbol);
