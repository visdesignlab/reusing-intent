import { Menu, MenuItem } from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { observer } from 'mobx-react';
import { FC, MouseEvent, useState } from 'react';

import { ExpectedItemProps } from '../layouts/ContextMenuLayout';

type Props = ExpectedItemProps;

const ContextMenu: FC<Props> = ({ handleClose: mainMenuClose, mainOpen }) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <>
      <MenuItem onClick={mainMenuClose} onMouseOver={handleOpen}>
        Test
        <ArrowRightIcon />
        <Menu
          anchorEl={anchorEl}
          anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
          open={Boolean(anchorEl) && mainOpen}
          keepMounted
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>Profile</MenuItem>
          <MenuItem onClick={handleClose}>My account</MenuItem>
          <MenuItem onClick={handleClose}>Logout</MenuItem>
        </Menu>
      </MenuItem>
    </>
  );
};

export default observer(ContextMenu);
