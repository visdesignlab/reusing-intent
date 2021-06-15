import { line, ScaleLinear, symbol, symbolWye } from 'd3';
import { observer } from 'mobx-react';
import { useMemo } from 'react';

import { KMeansInfo } from '../../../Store/Types/Prediction';
import translate from '../../../Utils/Translate';

type Props = {
  info: KMeansInfo;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
};

const KMeans = ({ info, xScale, yScale }: Props) => {
  const { selected_center } = info;

  const sym = symbol().type(symbolWye).size(64);

  const lineGen = useMemo(() => {
    const l = line()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]));

    return l;
  }, [xScale, yScale]);

  return (
    <g>
      <path
        d={sym() || ''}
        fill="blue"
        opacity="0.8"
        transform={translate(xScale(selected_center[0]), yScale(selected_center[1]))}
      />
      <path d={`${lineGen(info.hull)}Z` || ''} fill="gray" opacity="0.3" stroke="black" />
    </g>
  );
};

export default observer(KMeans);
