import { ScaleLinear } from 'd3';
import { observer } from 'mobx-react';
import React, { FC, useMemo } from 'react';

import { SkylineInfo } from '../../../Store/Types/Prediction';

type Props = {
  info: SkylineInfo;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
};

const Skyline: FC<Props> = ({ info, xScale, yScale }: Props) => {
  const { frontier } = info;

  const [x_sense, y_sense] = info.sense;

  console.log(x_sense, y_sense);

  const scaled_frontier = useMemo(() => {
    const front: { x: number; y: number }[] = frontier.map((val) => ({
      x: xScale(val[0]),
      y: yScale(val[1]),
    }));

    return front;
  }, [xScale, yScale, frontier]);

  return (
    <g>
      {scaled_frontier
        .sort((a, b) => a.x - b.x)
        .map((point, index, arr) => {
          if (index === arr.length - 1) return <g key={point.x} />;

          const next: { x: number; y: number } = arr[index + 1];

          return (
            <line
              key={point.x}
              stroke="black"
              strokeWidth="1"
              x1={point.x}
              x2={next.x}
              y1={y_sense === 'min' ? point.y : next.y}
              y2={y_sense === 'min' ? point.y : next.y}
            />
          );
        })}
      {scaled_frontier
        .sort((a, b) => a.y - b.y)
        .map((point, index, arr) => {
          if (index === arr.length - 1) return <g key={point.x} />;

          const next: { x: number; y: number } = arr[index + 1];

          return (
            <line
              key={point.x}
              stroke="black"
              strokeWidth="1"
              x1={x_sense === 'min' ? next.x : point.x}
              x2={x_sense === 'min' ? next.x : point.x}
              y1={point.y}
              y2={next.y}
            />
          );
        })}
    </g>
  );
};

export default observer(Skyline);
