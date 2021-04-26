/* eslint-disable @typescript-eslint/no-unused-vars */
import { ScaleLinear } from 'd3';
import { observer } from 'mobx-react';
import { useMemo } from 'react';

import { LinearRegressionInfo } from '../../../Store/Types/Prediction';

type Props = {
  info: LinearRegressionInfo;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
};

const LR = ({ info, xScale: x, yScale: y }: Props) => {
  const { x1, x2, y1, y2, oy1, oy2, ooy1, ooy2 } = useMemo(() => {
    const { coeff, intercept, threshold } = info;
    const xScale = x.copy().clamp(false);
    const yScale = y.copy().clamp(false);

    const line = (x: number) => x * coeff[0] + intercept;
    const line_offset = (x: number) => x * coeff[0] + intercept - 5 * threshold;
    const line_offset2 = (x: number) => x * coeff[0] + intercept + 5 * threshold;

    let [x1, x2] = x.domain();
    let [y1, y2] = x.domain().map(line);
    let [oy1, oy2] = x.domain().map(line_offset);
    let [ooy1, ooy2] = x.domain().map(line_offset2);

    [x1, x2, y1, y2, oy1, oy2, ooy1, ooy2] = [
      xScale(x1),
      xScale(x2),
      yScale(y1),
      yScale(y2),
      yScale(oy1),
      yScale(oy2),
      yScale(ooy1),
      yScale(ooy2),
    ];

    return { x1, x2, y1, y2, oy1, oy2, ooy1, ooy2 };
  }, [x, y, info]);

  return (
    <g clipPath="url(#clip)">
      <line opacity="0.4" stroke="black" strokeWidth="5px" x1={x1} x2={x2} y1={y1} y2={y2} />
      <line opacity="0.2" stroke="black" strokeWidth="2px" x1={x1} x2={x2} y1={oy1} y2={oy2} />
      <line opacity="0.2" stroke="black" strokeWidth="2px" x1={x1} x2={x2} y1={ooy1} y2={ooy2} />
    </g>
  );
};

export default observer(LR);
