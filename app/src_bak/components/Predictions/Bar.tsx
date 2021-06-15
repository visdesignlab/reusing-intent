import { createStyles, makeStyles, Typography } from '@material-ui/core';
import clsx from 'clsx';
import { scaleLinear } from 'd3';
import { observer } from 'mobx-react';
import { FC, useEffect, useMemo, useRef, useState } from 'react';

import translate from '../../Utils/Translate';
import { RANK_BAR_FOREGROUND } from '../ColorSpecs';

type Props = {
  height?: number;
  rank: number;
  label?: string;
};

const useStyles = makeStyles(() =>
  createStyles({
    common: {
      fill: RANK_BAR_FOREGROUND,
    },
    foreground: {
      opacity: 0.9,
    },
    background: {
      opacity: 0.3,
    },
    label: {
      fill: 'black',
    },
  }),
);

const Bar: FC<Props> = ({ rank, height = 45, label = rank.toFixed(2) }: Props) => {
  const classes = useStyles();
  const ref = useRef<SVGSVGElement>(null);

  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (ref.current) {
      const bounds = ref.current.getBoundingClientRect();

      if (width !== bounds.width) setWidth(bounds.width);
    }
  }, [width]);

  const scale = useMemo(() => {
    return scaleLinear().domain([0, 1]).range([0, width]);
  }, [width]);

  return (
    <svg ref={ref} height={height} width="100%">
      <rect className={clsx(classes.common, classes.background)} height={height} width={width} />
      <rect
        className={clsx(classes.common, classes.foreground)}
        height={height}
        width={scale(rank)}
      />
      <Typography
        className={classes.label}
        component="text"
        dominantBaseline="middle"
        textAnchor="start"
        transform={translate(width * 0.05, height / 2)}
        variant="button"
      >
        {label}
      </Typography>
    </svg>
  );
};

export default observer(Bar);
