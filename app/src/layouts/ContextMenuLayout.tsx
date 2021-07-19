import { makeStyles, Menu } from '@material-ui/core';
import { observer } from 'mobx-react';
import { FC, useCallback, useState } from 'react';

const useStyles = makeStyles(() => ({
  root: {
    height: '100%',
    width: '100%',
  },
}));

type MouseState = {
  mouseX: number | null;
  mouseY: number | null;
};

const initState: MouseState = {
  mouseX: null,
  mouseY: null,
};

export type ExpectedItemProps = {
  handleClose: () => void;
  mainOpen: boolean;
};

type Props = {
  menuItems: FC<ExpectedItemProps>;
};

const ContextMenuLayout: FC<Props> = ({ children, menuItems: MenuItems }) => {
  const styles = useStyles();
  const [position, setPosition] = useState<MouseState>(initState);

  const handleClick = useCallback((ev: React.MouseEvent) => {
    ev.preventDefault();
    setPosition({
      mouseX: ev.clientX - 2,
      mouseY: ev.clientY - 2,
    });
  }, []);

  const handleClose = useCallback(() => setPosition(initState), []);

  return (
    <div className={styles.root} onContextMenu={handleClick}>
      {children}
      <Menu
        anchorPosition={
          position.mouseY !== null && position.mouseX !== null
            ? { top: position.mouseY, left: position.mouseX }
            : undefined
        }
        anchorReference="anchorPosition"
        open={position.mouseY !== null}
        keepMounted
        onClose={handleClose}
      >
        <MenuItems handleClose={handleClose} mainOpen={position.mouseY !== null} />
      </Menu>
    </div>
  );
};

export default observer(ContextMenuLayout);
