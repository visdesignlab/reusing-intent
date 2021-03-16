import { Input, Tooltip, Typography } from '@material-ui/core';
import { observer } from 'mobx-react';
import React, { useState } from 'react';

type Props = {
  text: string;
  handleType: (text: string) => void;
  color: string;
};

const Editable = ({ text, handleType, color }: Props) => {
  const [isEditing, setIsEditing] = useState(false);

  return isEditing ? (
    <Input
      value={text}
      onBlur={() => setIsEditing(false)}
      onChange={(event) => {
        event.stopPropagation();
        handleType(event.target.value);
      }}
    />
  ) : (
    <Tooltip title={text}>
      <Typography
        align="center"
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        color={color as any}
        style={{ width: '100px' }}
        variant="button"
        noWrap
        onClick={() => setIsEditing(true)}
      >
        {text}
      </Typography>
    </Tooltip>
  );
};

export default observer(Editable);
