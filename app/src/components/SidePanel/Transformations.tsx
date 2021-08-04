import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  createStyles,
  makeStyles,
  Menu,
  MenuItem,
} from '@material-ui/core';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { observer } from 'mobx-react';
import { useState } from 'react';

import { useStore } from '../../stores/RootStore';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      minWidth: 250,
    },
    content: {
      display: 'flex',
      justifyContent: 'center',
    },
  }),
);

const Transformations = () => {
  const styles = useStyles();

  const {
    exploreStore: { handleFilter },
  } = useStore();

  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);

  type AnchorType = typeof filterAnchorEl;
  type SetterType = typeof setFilterAnchorEl;

  const handleToggle = (setter: SetterType, target: AnchorType) => {
    setter(target);
  };

  const handleClose = (setter: SetterType) => setter(null);

  return (
    <Card className={styles.root}>
      <CardHeader title="Transforms" />
      <CardContent>
        <Box m={1}>
          <Button
            color="primary"
            endIcon={<ArrowRightIcon />}
            variant="outlined"
            onClick={(e) => handleToggle(setFilterAnchorEl, e.currentTarget)}
          >
            Filter
          </Button>
          <Menu
            anchorEl={filterAnchorEl}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            open={Boolean(filterAnchorEl)}
            keepMounted
            onClose={() => handleClose(setFilterAnchorEl)}
          >
            <MenuItem
              onClick={() => {
                handleFilter('In');
                handleClose(setFilterAnchorEl);
              }}
            >
              In
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleFilter('Out');
                handleClose(setFilterAnchorEl);
              }}
            >
              Out
            </MenuItem>
          </Menu>
        </Box>

        <Box m={1}>
          <Button color="primary" variant="outlined">
            Label
          </Button>
        </Box>

        <Box m={1}>
          <Button color="primary" variant="outlined">
            Aggregate
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default observer(Transformations);
