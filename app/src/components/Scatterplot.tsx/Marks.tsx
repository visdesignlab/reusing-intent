import { ScaleLinear } from 'd3';
import { observer } from 'mobx-react';
import React, { FC } from 'react';

type Props = {
  points: { x: number; y: number; label: string }[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
};

const Marks: FC<Props> = ({ points, xScale, yScale }: Props) => {
  return (
    <>
      {points.map((point) => {
        return (
          <circle
            key={point.label}
            cx={xScale(point.x as number)}
            cy={yScale(point.y as number)}
            fill="black"
            opacity="0.5"
            r="5"
          />
        );
      })}
    </>
  );
};

export default observer(Marks);
