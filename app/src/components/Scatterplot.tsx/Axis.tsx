import { axisBottom, axisLeft, axisRight, axisTop, ScaleLinear, select } from 'd3';
import { observer } from 'mobx-react';
import React, { FC, useContext, useEffect, useMemo, useRef } from 'react';

import Store from '../../Store/Store';
import translate from '../../Utils/Translate';

type Props = {
  scale: ScaleLinear<number, number>;
  transform?: string;
  type: 'left' | 'right' | 'top' | 'bottom';
  columnName: string;
};

const Axis: FC<Props> = ({ scale, transform = '', type, columnName }: Props) => {
  const gRef = useRef<SVGGElement>(null);
  const {
    loadedDataset: { columnInfo },
  } = useContext(Store).exploreStore;

  const axis = useMemo(() => {
    let axis = null;

    switch (type) {
      case 'left':
        axis = axisLeft(scale);
        break;
      case 'right':
        axis = axisRight(scale);
        break;
      case 'bottom':
        axis = axisBottom(scale);
        break;
      case 'top':
        axis = axisTop(scale);
        break;
    }

    axis.tickFormat((d) => {
      if (d >= 1000000) return `${d.toString()[0]}e${d.toString().length - 1}`;

      if (d >= 500000) return `${(d as number) / 100000}M`;

      if (d >= 1000) return `${(d as number) / 1000}K`;

      return d.toString();
    });

    return axis;
  }, [scale, type]);

  useEffect(() => {
    const { current } = gRef;

    if (!current) return;

    select(current).call(axis);
  }, [axis]);

  const labelTransform = useMemo(() => {
    switch (type) {
      case 'bottom':
        return translate(Math.max(...scale.range()) / 2, 35);
      case 'top':
        return translate(Math.max(...scale.range()) / 2, -35);
      case 'left':
        return `${translate(-40, Math.max(...scale.range()) / 2)}rotate(270)`;
      case 'right':
        return `${translate(40, Math.max(...scale.range()) / 2)}rotate(90)`;
    }
  }, [scale, type]);

  const column = columnInfo[columnName];

  return (
    <g transform={transform}>
      <g ref={gRef} />
      <text dominantBaseline="middle" textAnchor="middle" transform={labelTransform}>
        <tspan>{column.short}</tspan> <tspan>|</tspan> <tspan>{column.fullname}</tspan>{' '}
        {column.unit && <tspan>({column.unit})</tspan>}
      </text>
    </g>
  );
};

export default observer(Axis);
