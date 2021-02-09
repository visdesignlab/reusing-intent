import { observer } from 'mobx-react';
import React, { FC } from 'react';

import { Prediction } from '../../../Store/Types/Prediction';

type Props = {
  prediction: Prediction;
};

const Overlay: FC<Props> = ({ prediction }: Props) => {
  return (
    <g>
      <text>Overlay {prediction.intent}</text>
    </g>
  );
};

export default observer(Overlay);
