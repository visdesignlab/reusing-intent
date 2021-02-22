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

  const { scaled_frontier } = useMemo(() => {
    const scaled_frontier: { x: number; y: number }[] = frontier.map((val) => ({
      x: xScale(val[0]),
      y: yScale(val[1]),
    }));

    return { scaled_frontier };
  }, [xScale, yScale, frontier]);

  const { x_lines, y_lines } = useMemo(() => {
    let x_lines = <g />;
    let y_lines = <g />;

    console.log({ x_sense, y_sense });

    x_lines = (
      <g className="frontier-x">
        {[...scaled_frontier]
          .sort((a, b) => (x_sense === 'max' ? a.x - b.x : b.x - a.x))
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          .map((n, idx, arr) => {
            const key = `${n.x}-${n.y}`;

            if (idx === 0)
              return (
                <line
                  key={key}
                  stroke="black"
                  x1={x_sense === 'max' ? xScale.range()[0] : n.x}
                  x2={x_sense === 'max' ? n.x : xScale.range()[1]}
                  y1={n.y}
                  y2={n.y}
                />
              );

            const p = arr[idx - 1];

            return <line key={key} stroke="black" x1={p.x} x2={n.x} y1={n.y} y2={n.y} />;
          })}
      </g>
    );

    y_lines = (
      <g>
        {[...scaled_frontier]
          .sort((a, b) => (y_sense === 'max' ? a.y - b.y : b.y - a.y))
          .map((n, idx, arr) => {
            const key = `${n.x}-${n.y}`;

            if (idx === arr.length - 1)
              return (
                <line
                  key={key}
                  stroke="black"
                  x1={n.x}
                  x2={n.x}
                  y1={y_sense === 'max' ? n.y : yScale.range()[1]}
                  y2={y_sense === 'max' ? yScale.range()[0] : n.y}
                />
              );

            const p = arr[idx + 1];

            return <line key={key} stroke="black" x1={n.x} x2={n.x} y1={n.y} y2={p.y} />;
          })}
      </g>
    );

    return { x_lines, y_lines };
  }, [scaled_frontier, x_sense, y_sense, xScale, yScale]);

  return (
    <g>
      {x_lines}
      {y_lines}
    </g>
  );
};

export default observer(Skyline);
