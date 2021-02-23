/* eslint-disable @typescript-eslint/no-unused-vars */
import { observer } from 'mobx-react';
import React, { FC } from 'react';

import translate from '../../Utils/Translate';
import useScatterplotStyle from '../Scatterplot/styles';

import { createComet } from './ComparisonMarks';

type Props = {
  offset?: number;
  setDataDisplay: any;
};

const Legend: FC<Props> = ({ offset = 0, setDataDisplay }: Props) => {
  const classes = useScatterplotStyle();

  return (
    <svg height={30} width={700}>
      <g>
        <g
          transform={translate(0, 0)}
          onMouseEnter={() => setDataDisplay('Original')}
          onMouseLeave={() => setDataDisplay('All')}
        >
          <circle className={`marks ${classes.regularMark}`} cx={12.5} cy={5} opacity=".5" r="5" />

          <text dominantBaseline="middle" dx="25" dy="5">
            v1
          </text>
        </g>
        <g
          transform={translate(100, 0)}
          onMouseEnter={() => setDataDisplay('Comparison')}
          onMouseLeave={() => setDataDisplay('All')}
        >
          <circle className={`marks ${classes.regularMark}`} cx={12.5} cy={5} opacity=".5" r="5" />

          <text dominantBaseline="middle" dx="25" dy="5">
            v2
          </text>
        </g>

        <g
          transform={translate(200, 0)}
          onMouseEnter={() => setDataDisplay('RemovedOnly')}
          onMouseLeave={() => setDataDisplay('All')}
        >
          <g className={`marks ${classes.removedMark}`} opacity="0.5" transform={translate(10, 0)}>
            <line x2="6" y2="6" />
            <line x1="6" y2="6" />
          </g>
          <text dominantBaseline="middle" dx="25" dy="5">
            Removed
          </text>
        </g>
        <g
          transform={translate(300, 0)}
          onMouseEnter={() => setDataDisplay('AddedOnly')}
          onMouseLeave={() => setDataDisplay('All')}
        >
          <g className={`marks ${classes.newMark}`} opacity="0.5" transform={translate(10, 0)}>
            <polygon points="0 0, 5 10, 10 0" />
          </g>
          <text dominantBaseline="middle" dx="32" dy="5">
            Added
          </text>
        </g>
        <g
          transform={translate(400, 0)}
          onMouseEnter={() => {
            setDataDisplay('ChangedOnly');
          }}
          onMouseLeave={() => setDataDisplay('All')}
        >
          <path
            className={`marks ${classes.movedLine}`}
            d={createComet(5, 25, 5, 5)}
            style={{ opacity: '0.4' }}
          />
          <circle className={`marks ${classes.movedPoint}`} cx={5} cy={5} opacity=".2" r="5" />
          <circle className={`marks ${classes.movedPoint}`} cx={25} cy={5} opacity="1" r="5" />
          <text dominantBaseline="middle" dx="32" dy="5">
            Point Moved
          </text>
        </g>
        <g
          transform={translate(550, 0)}
          onMouseEnter={() => {
            setDataDisplay('Diff');
          }}
          onMouseLeave={() => setDataDisplay('All')}
        >
          <g className={`marks ${classes.removedMark}`} opacity="0.5" transform={translate(-15, 0)}>
            <line x2="6" y2="6" />
            <line x1="6" y2="6" />
          </g>
          <g className={`marks ${classes.newMark}`} opacity="0.5" transform={translate(-35, 0)}>
            <polygon points="0 0, 5 10, 10 0" />
          </g>
          <path
            className={`marks ${classes.movedLine}`}
            d={createComet(5, 25, 5, 5)}
            style={{ opacity: '0.4' }}
          />
          <circle className={`marks ${classes.movedPoint}`} cx={5} cy={5} opacity=".2" r="5" />
          <circle className={`marks ${classes.movedPoint}`} cx={25} cy={5} opacity="1" r="5" />
          <text dominantBaseline="middle" dx="32" dy="5">
            All Changed Data
          </text>
        </g>
      </g>
    </svg>
  );
};

export default observer(Legend);
