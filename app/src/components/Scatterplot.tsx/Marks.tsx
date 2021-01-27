import { ScaleLinear } from 'd3';
import { observer } from 'mobx-react';
import React, { FC } from 'react';

import useScatterplotStyle from './styles';

type Props = {
  points: { x: number; y: number; label: string; id: string }[];
  selectedPoints: string[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
};

const Marks: FC<Props> = ({ points, selectedPoints, xScale, yScale }: Props) => {
  const classes = useScatterplotStyle();

  return (
    <>
      {points.map((point) => {
        return (
          <circle
            key={point.label}
            className={`marks ${
              selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
            }`}
            cx={xScale(point.x as number)}
            cy={yScale(point.y as number)}
            id={`mark${point.id}`}
            opacity="0.5"
            r="5"
          />
        );
      })}
    </>
  );
};

export default observer(Marks);
