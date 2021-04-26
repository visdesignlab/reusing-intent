import { observer } from 'mobx-react';
import { FC } from 'react';

import translate from '../../Utils/Translate';
import { IPNS, ISNP, MATCHES } from '../ColorSpecs';

type Props = {
  offset?: number;
};

const Legend: FC<Props> = ({ offset = 0 }: Props) => {
  return (
    <g transform={translate(offset, -10)}>
      <g transform={translate(0, 20)}>
        <circle fill={MATCHES} r="5" />
        <text dominantBaseline="middle" dx="10">
          Matches
        </text>
      </g>
      <g transform={translate(0, 40)}>
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
      </g>
    </g>
  );
};

export default observer(Legend);
