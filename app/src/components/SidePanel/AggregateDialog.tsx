import {
  Button,
  createStyles,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormHelperText,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
} from '@material-ui/core';
import { observer } from 'mobx-react';
import { useContext, useEffect, useState } from 'react';

import { AggMap, GlobalPlotAttributeContext } from '../../contexts/CategoryContext';
import { useStore } from '../../stores/RootStore';

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
  open: boolean;
  onClose: () => void;
  onSet: () => void;
};

const AggregateDialog = ({ open, onSet, onClose }: Props) => {
  const styles = useStyles();
  const {
    exploreStore: { data },
  } = useStore();

  const {
    setAggregateOptions = () => {
      throw new Error('SOmething went wrong');
    },
  } = useContext(GlobalPlotAttributeContext) || {};

  const [optionsMap, setOptionsMap] = useState<AggMap>({});

  useEffect(() => {
    if (!data) return;

    if (Object.keys(optionsMap).length === 0) {
      const { numericColumns } = data;
      const opts: AggMap = {};

      numericColumns.forEach((col) => {
        opts[col] = 'Mean';
      });

      setOptionsMap(opts);
    }
  }, [optionsMap, data]);

  const options = ['Mean', 'Median', 'Sum', 'Min', 'Max'];

  if (!data) return <div>Loading...</div>;

  const { numericColumns = [], columnInfo } = data;

  const canSet = Object.keys(optionsMap).length === numericColumns.length;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Aggregate</DialogTitle>
      <DialogContent>
        <DialogContentText>Select how each numeric column should be aggregated.</DialogContentText>
        {numericColumns.map((column) => {
          return (
            <div key={column}>
              <FormControl className={styles.formControl}>
                <InputLabel id={`${column}_label`}>{columnInfo[column].fullname}</InputLabel>
                <Select
                  id={column}
                  labelId={`${column}_label`}
                  value={optionsMap[column]}
                  onChange={(ev) => {
                    setOptionsMap(
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      (opt) => ({ ...opt, [column]: ev.target.value as string } as any),
                    );
                  }}
                >
                  {options.map((opt) => (
                    <MenuItem key={opt} value={opt}>
                      {opt}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>{columnInfo[column].unit}</FormHelperText>
              </FormControl>
            </div>
          );
        })}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={!canSet}
          onClick={() => {
            localStorage.setItem('aggOpt', JSON.stringify(optionsMap));
            setAggregateOptions(optionsMap);
            onClose();
            onSet();
          }}
        >
          Set
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default observer(AggregateDialog);
