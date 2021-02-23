import { makeStyles, Typography } from '@material-ui/core';
import clsx from 'clsx';
import { observer } from 'mobx-react';
import React, { FC } from 'react';

import translate from '../../../Utils/Translate';

type Props = {
  transform?: string;
  height?: number;
  width?: number;
  lineHeight?: number;
};

const useStyles = makeStyles(() => ({
  lineBase: {
    strokeWidth: 2,
    strokeOpacity: 0.3,
  },
  line: {
    stroke: 'black',
  },
  hatch: {
    strokeWidth: 5,
    stroke: 'url(#pattern)',
  },
}));

const SkylineLegend: FC<Props> = ({
  height = 25,
  lineHeight = height,
  width = 150,
  transform = translate(0),
}: Props) => {
  const classes = useStyles();

  const [x1, x2, y1, y2] = [0, 0, 0, lineHeight];

  return (
    <g transform={transform}>
      <g transform={translate(width / 2, 0)}>
        <line className={clsx(classes.lineBase, classes.line)} x1={x1} x2={x2} y1={y1} y2={y2} />
        <line
          className={clsx(classes.lineBase, classes.hatch)}
          transform={translate(5, 0)}
          x1={x1}
          x2={x2}
          y1={y1}
          y2={y2}
        />
        <Typography component="text" transform={translate(10, height / 2)} variant="button">
          <tspan x="0">Dominated</tspan>
          <tspan dy="1em" x="0">
            Region
          </tspan>
        </Typography>
      </g>
    </g>
  );
};

export default observer(SkylineLegend);
