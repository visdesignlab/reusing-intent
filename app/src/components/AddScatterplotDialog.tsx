import {
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
} from '@material-ui/core';
import { observer } from 'mobx-react';
import { useCallback, useState } from 'react';
import { Button } from 'semantic-ui-react';

import { useStore } from '../stores/RootStore';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 200,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }),
);
type Props = {
  show: boolean;
  onClose: () => void;
};

const AddScatterplotDialog = ({ show, onClose }: Props) => {
  const styles = useStyles();

  const {
    exploreStore: { data, addScatterplot },
  } = useStore();

  const [x, setX] = useState('');
  const [y, setY] = useState('');

  const handleClose = useCallback(() => {
    setX('');
    setY('');
    onClose();
  }, [onClose]);

  if (!data) return <div>Test</div>;

  return (
    <Dialog open={show} onClose={handleClose}>
      <DialogContent>
        <DialogContentText>Select dimensions</DialogContentText>

        <FormControl className={styles.formControl}>
          <InputLabel id="x-col-label">X</InputLabel>
          <Select
            id="x-col"
            labelId="x-col-label"
            value={x}
            onChange={(ev) => {
              setX(ev.target.value as string);
            }}
          >
            {data.numericColumns.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl className={styles.formControl}>
          <InputLabel id="y-col-label">Y</InputLabel>
          <Select
            id="y-col"
            labelId="y-col-label"
            value={y}
            onChange={(ev) => {
              setY(ev.target.value as string);
            }}
          >
            {data.numericColumns.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          disabled={!x || !y}
          onClick={() => {
            addScatterplot(x, y);
            handleClose();
          }}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(AddScatterplotDialog);
