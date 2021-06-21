
import { ScaleLinear, line } from 'd3';
import { observer } from 'mobx-react';
import React, { FC, useState } from 'react';
import clsx from 'clsx';

import { DataPoint } from '../../Store/Types/Dataset';
import useScatterplotStyle from '../Scatterplot/styles';


type Props = {
  points: DataPoint[];
  allScales: { [key: string]: ScaleLinear<number, number> };
  pcp_dimension: number;
};

const Marks: FC<Props> = ({ points, allScales, pcp_dimension }: Props) => {
  const lineGenerator = line()

  const [hoverLine, setHoverLine] = useState("")
    const classes = useScatterplotStyle();

  
  return (
    <>
      {points.map((point) => {

        const path: [number, number][] = []

        let count = 0;

        for (const j in allScales)
        {
            path.push([100 + count * 200, allScales[j]((point[j] as number))])
            count++;
        }

        return (
          <path
            key={point.label}
            className={clsx('marks', {
              [classes.normalLine]: hoverLine !== point.id,
              [classes.hoverLine]: hoverLine === point.id,
            })}
            d={lineGenerator(path) as string}
            fill="none"
            id={`line${point.id}`}
            opacity="0.5"
            stroke="grey"
            strokeWidth={2}
            transform={`translate(0,${pcp_dimension / 4})`}
            onMouseEnter={() => setHoverLine(point.id)}
            onMouseLeave={() => setHoverLine('')}
          />
        );
      })}
    </>
  );
};

export default observer(Marks);
