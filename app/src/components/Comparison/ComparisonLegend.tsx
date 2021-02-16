import { observer } from 'mobx-react';
import React, { FC } from 'react';

import translate from '../../Utils/Translate';
import useScatterplotStyle from '../Scatterplot/styles';

import { createComet } from './ComparisonMarks';

type Props = {
  offset?: number;
};

const Legend: FC<Props> = ({ offset = 0 }: Props) => {
  const classes = useScatterplotStyle();

  return (
    <g transform={translate(offset, -10)}>
      <g transform={translate(20, 20)}>
        <g className={`marks ${classes.removedMark}`} opacity="0.5" transform={translate(20, 20)}>
          <line x2="6" y2="6" />
          <line x1="6" y2="6" />
        </g>
        <text dominantBaseline="middle" dx="10">
          Removed
        </text>
      </g>
      <g transform={translate(0, 40)}>
        <g className={`marks ${classes.newMark}`} opacity="0.5">
          <polygon points="0 0, 5 10, 10 0" />
        </g>
        <text dominantBaseline="middle" dx="10">
          Added
        </text>
      </g>
      <g transform={translate(0, 60)}>
        <path
          className={`marks ${classes.movedLine}`}
          d={createComet(
            5,
            15,
            5,
            5,
          )}
          style={{ opacity: '0.4' }}
        />
        <circle
          className={`marks ${classes.movedPoint}`}
          cx={5}
          cy={5}
          opacity=".2"
          r="5"
        />
        <circle
          className={`marks ${classes.movedPoint}`}
          cx={15}
          cy={5}
          opacity="1"
          r="5"
        />
        <text dominantBaseline="middle" dx="10">
          Point Moved
        </text>
      </g>
    </g>
  );
};

export default observer(Legend);
