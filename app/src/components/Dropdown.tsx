import {
  createStyles,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
} from '@material-ui/core';
import React, { useState } from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      width: 200,
    },
  }),
);

function useDropdown(
  id: string,
  label: string,
  defaultState: string,
  opts: { key: string; desc: string }[],
  val?: string,
  setVal?: (val: string) => void,
) {
  const classes = useStyles();
  const [selected, setSelected] = useState(defaultState);

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const val = event.target.value as string;

    if (setVal) {
      setVal(val);
    } else {
      setSelected(val);
    }
  };

  const Dropdown = () => (
    <FormControl className={classes.formControl} variant="outlined">
      <InputLabel id={id}>{label}</InputLabel>
      <Select
        id={`${id}-select`}
        label={label}
        labelId={id}
        value={val ? val : selected}
        onChange={handleChange}
      >
        {opts.map((opt) => (
          <MenuItem key={opt.key} value={opt.key}>
            {opt.desc}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return { selected, Dropdown, setSelected };
}

export default useDropdown;
