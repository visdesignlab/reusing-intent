import {
  createStyles,
  FormControl,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
} from '@material-ui/core';
import { observer } from 'mobx-react';
import React, { FC, useState } from 'react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
    },
    formControlNoWidth: {
      margin: theme.spacing(1),
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }),
);

type Props = {
  values: { key: string; desc: string }[];
  label: string;
  text: string;
  onChange?: (val: string) => void;
};

const Dropdown: FC<Props> = ({ values, label, text, onChange }: Props) => {
  const classes = useStyles();
  const [val, setValue] = useState('');

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const val = event.target.value as string;
    setValue(val);

    if (onChange) onChange(val);
  };

  return (
    <FormControl className={classes.formControl} variant="outlined">
      <InputLabel id={label}>{text}</InputLabel>
      <Select
        id={`${label}-select`}
        label={text}
        labelId={label}
        value={val}
        onChange={handleChange}
      >
        {values.map((val) => (
          <MenuItem key={val.key} value={val.key}>
            {val.desc}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default observer(Dropdown);
