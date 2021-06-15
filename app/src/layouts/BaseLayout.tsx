import { Dialog, DialogContent, DialogTitle, Fab, makeStyles, Theme } from '@material-ui/core';
import CodeIcon from '@material-ui/icons/Code';
import { observer } from 'mobx-react';
import { FC, useState } from 'react';

import DebugDialog from '../components/DebugDialog';

const useStyles = makeStyles((theme: Theme) => {
  return {
    fab: {
      position: 'absolute',
      left: theme.spacing(2),
      bottom: theme.spacing(2),
      'z-index': 100000,
    },
  };
});

const BaseLayout: FC = ({ children }) => {
  const styles = useStyles();
  const [debugMenuOpen, setDebugMenuOpen] = useState<'open' | 'close'>('close');

  const handleClose = () => {
    setDebugMenuOpen('close');
  };

  return (
    <>
      {children}
      <Fab className={styles.fab} color="primary" onClick={() => setDebugMenuOpen('open')}>
        <CodeIcon />
      </Fab>
      <Dialog open={debugMenuOpen === 'open'} onClose={handleClose}>
        <DialogTitle>Debug Menu</DialogTitle>
        <DialogContent>
          <DebugDialog />
        </DialogContent>
      </Dialog>
    </>
  );
};

export default observer(BaseLayout);
