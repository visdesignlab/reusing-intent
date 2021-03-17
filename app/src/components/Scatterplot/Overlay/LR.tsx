import { ScaleLinear } from 'd3';
import { observer } from 'mobx-react';
import React from 'react';

import { LinearRegressionInfo } from '../../../Store/Types/Prediction';

type Props = {
  info: LinearRegressionInfo;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
};

const LR = ({ info, xScale, yScale }: Props) => {
  const [minX, maxX] = xScale.domain();
  const [minY, maxY] = [minX, maxX].map((x) => info.coeff[0] * x + info.intercept);

  return (
    <g>
      <line
        stroke="black"
        strokeWidth="1px"
        x1={xScale(minX)}
        x2={xScale(maxX)}
        y1={yScale(minY)}
        y2={yScale(maxY)}
      />
    </g>
  );
};

export default observer(LR);
