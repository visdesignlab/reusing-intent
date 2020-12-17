import { createStyles, makeStyles, useTheme } from '@material-ui/core';
import { extent, ScaleLinear, scaleLinear } from 'd3';
import { observer } from 'mobx-react';
import React, { FC, useContext, useMemo } from 'react';

import { DatasetColumn } from '../../Store/Dataset';
import { Plot } from '../../Store/IntentState';
import IntentStore from '../../Store/Store';
import translate from '../../Utils/Translate';

import Axis from './Axis';
import Marks from './Marks';

const useStyles = makeStyles(() =>
  createStyles({
    root: (props: { dimension: number }) => ({
      width: props.dimension,
      height: props.dimension,
    }),
  }),
);

type Props = {
  plot: Plot;
  size: number;
};

function useScatterplotData(
  x: DatasetColumn,
  y: DatasetColumn,
  label: DatasetColumn,
): {
  points: { x: number; y: number; label: string }[];
  x_extents: [number, number];
  y_extents: [number, number];
} {
  const { data } = useContext(IntentStore);
  const dt =
    useMemo(() => {
      const points = data?.values.map((d) => ({
        x: d[x] as number,
        y: d[y] as number,
        label: d[label] as string,
      }));
      const x_extents = extent(points.map((d) => d.x) as number[]) as [number, number];
      const y_extents = extent(points.map((d) => d.y) as number[]) as [number, number];

      return { points, x_extents, y_extents };
    }, [data, x, y, label]) || [];

  return dt;
}

function useScale(
  domain: [number, number],
  range: [number, number],
  nice = true,
): ScaleLinear<number, number> {
  const [d0, d1] = domain;
  const [r0, r1] = range;

  const scale = useMemo(() => {
    const scale = scaleLinear().domain([d0, d1]).range([r0, r1]);

    if (nice) scale.nice();

    return scale;
  }, [d0, d1, r0, r1, nice]);

  return scale;
}

const Scatterplot: FC<Props> = ({ plot, size }: Props) => {
  const theme = useTheme();
  const dimension = size - 2 * theme.spacing(1);
  const { root } = useStyles({ dimension });
  const {
    data: { labelColumn },
  } = useContext(IntentStore);
  const { x, y } = plot;

  const { points, x_extents, y_extents } = useScatterplotData(x, y, labelColumn);

  const margin = theme.spacing(10);
  const sp_dimension = dimension - 2 * margin;

  const xScale = useScale(x_extents, [0, sp_dimension]);
  const yScale = useScale(y_extents, [sp_dimension, 0]);

  return (
    <svg className={root}>
      <g transform={translate(margin)}>
        <Axis columnName={x} scale={xScale} transform={translate(0, sp_dimension)} type="bottom" />
        <Axis columnName={y} scale={yScale} type="left" />
        <Marks points={points} xScale={xScale} yScale={yScale} />
      </g>
    </svg>
  );
};

export default observer(Scatterplot);
