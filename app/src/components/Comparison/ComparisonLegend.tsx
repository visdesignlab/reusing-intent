import { observer } from 'mobx-react';
import React, { FC } from 'react';

import translate from '../../Utils/Translate';
import useScatterplotStyle from '../Scatterplot/styles';

type Props = {
  offset?: number;
};

const Legend: FC<Props> = ({ offset = 0 }: Props) => {
  const classes = useScatterplotStyle();

  return (
    <g transform={translate(offset, -10)}>
      <g transform={translate(20, 20)}>
        <g
          className={`marks ${classes.removedMark}`}
          opacity="0.5"
          transform={translate(20, 20)}
        >
          <line x2="6" y2="6" />
          <line x1="6" y2="6" />
        </g>
        <text dominantBaseline="middle" dx="10">
          Removed
        </text>
      </g>
      {/* <g transform={translate(0, 40)}>
        <circle fill={IPNS} r="5" />
        <text dominantBaseline="middle" dx="10">
          Not Selected
        </text>
      </g>
      <g transform={translate(0, 60)}>
        <circle fill={ISNP} r="5" />
        <text dominantBaseline="middle" dx="10">
          Not Predicted
        </text>
      </g> */}
    </g>
  );
};

export default observer(Legend);
