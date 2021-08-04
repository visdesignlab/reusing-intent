import { Card, CardContent, CardHeader, createStyles, makeStyles } from '@material-ui/core';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { observer } from 'mobx-react';

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

const BrushSelector = () => {
  const styles = useStyles();
  const {
    exploreStore: { brushType, switchBrush },
  } = useStore();

  return (
    <Card className={styles.root}>
      <CardHeader title="Brush Type" />
      <CardContent className={styles.content}>
        <ToggleButtonGroup
          size="small"
          value={brushType}
          exclusive
          onChange={(_, bt) => switchBrush(bt)}
        >
          <ToggleButton value="Rectangular">
            <CheckBoxOutlineBlankIcon />
          </ToggleButton>
          <ToggleButton value="Freeform Small">
            <RadioButtonUncheckedIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="Freeform Medium">
            <RadioButtonUncheckedIcon />
          </ToggleButton>
          <ToggleButton value="Freeform Large">
            <RadioButtonUncheckedIcon fontSize="large" />
          </ToggleButton>
        </ToggleButtonGroup>
      </CardContent>
    </Card>
  );
};

export default observer(BrushSelector);
