import { line, ScaleLinear } from 'd3';
import { observer } from 'mobx-react';
import React, { useMemo } from 'react';

import { DBScanInfo } from '../../../Store/Types/Prediction';

type Props = {
  info: DBScanInfo;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
};

const DBScan = ({ info, xScale, yScale }: Props) => {
  const lineGen = useMemo(() => {
    const l = line()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]));

    return l;
  }, [xScale, yScale]);

  return (
    <g>
      <path d={lineGen(info.hull) || ''} fill="gray" opacity="0.3" stroke="black" />
    </g>
  );
};

export default observer(DBScan);
