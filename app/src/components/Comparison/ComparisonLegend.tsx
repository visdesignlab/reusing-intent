/* eslint-disable @typescript-eslint/no-unused-vars */
import { observer } from 'mobx-react';
import React, { FC } from 'react';

import translate from '../../Utils/Translate';
import useScatterplotStyle from '../Scatterplot/styles';

import { createComet } from './ComparisonMarks';

type Props = {
  offset?: number;
  setDataDisplay: any;
  dataDisplay: string;
  selectedPoints: boolean;
};

const Legend: FC<Props> = ({ offset = 0, setDataDisplay, dataDisplay, selectedPoints = false }: Props) => {
  const classes = useScatterplotStyle();

  console.log(selectedPoints)

  return (
    <svg height={30} width={700}>
      <g>
        <g
          transform={translate(0, 10)}
          onMouseDown={() => {
            if (dataDisplay === 'Original') {
              setDataDisplay('All');
            } else {
              setDataDisplay('Original');
            }
          }}
        >
          <circle className={`marks ${classes.regularMark}`} cx={12.5} cy={5} opacity=".5" r="5" />
          {dataDisplay === 'Original' ? (
            <rect height={25} opacity=".2" rx={20} transform={translate(0, -8)} width={100} />
          ) : null}

          <text
            dominantBaseline="middle"
            dx="25"
            dy="5"
            font-weight={dataDisplay === 'Original' ? 'bold' : 'normal'}
          >
            v1
          </text>
        </g>
        <g
          transform={translate(100, 10)}
          onMouseDown={() => {
            if (dataDisplay === 'Comparison') {
              setDataDisplay('All');
            } else {
              setDataDisplay('Comparison');
            }
          }}
        >
          <circle className={`marks ${classes.regularMark}`} cx={12.5} cy={5} opacity=".5" r="5" />
          {dataDisplay === 'Comparison' ? (
            <rect height={25} opacity=".2" rx={20} transform={translate(0, -8)} width={100} />
          ) : null}
          <text dominantBaseline="middle" dx="25" dy="5">
            v2
          </text>
        </g>

        <g
          transform={translate(200, 10)}
          onMouseDown={() => {
            if (dataDisplay === 'RemovedOnly') {
              setDataDisplay('All');
            } else {
              setDataDisplay('RemovedOnly');
            }
          }}
        >
          <g
            className={`marks ${classes.removedMark} ${
              !selectedPoints ? classes.removedColor : ''
            }`}
            opacity="0.5"
            transform={translate(10, 0)}
          >
            <line x2="6" y2="6" />
            <line x1="6" y2="6" />
          </g>
          {dataDisplay === 'RemovedOnly' ? (
            <rect height={25} opacity=".2" rx={20} transform={translate(0, -8)} width={100} />
          ) : null}
          <text dominantBaseline="middle" dx="25" dy="5">
            Removed
          </text>
        </g>
        <g
          transform={translate(300, 10)}
          onMouseDown={() => {
            if (dataDisplay === 'AddedOnly') {
              setDataDisplay('All');
            } else {
              setDataDisplay('AddedOnly');
            }
          }}
        >
          <g
            className={`marks ${classes.newMark} ${!selectedPoints ? classes.newColor : ''}`}
            opacity="0.5"
            transform={translate(10, 0)}
          >
            {dataDisplay === 'AddedOnly' ? (
              <rect height={25} opacity=".2" rx={20} transform={translate(-10, -8)} width={100} />
            ) : null}
            <polygon points="0 0, 5 10, 10 0" />
          </g>
          <text dominantBaseline="middle" dx="32" dy="5">
            Added
          </text>
        </g>
        <g
          transform={translate(400, 10)}
          onMouseDown={() => {
            if (dataDisplay === 'ChangedOnly') {
              setDataDisplay('All');
            } else {
              setDataDisplay('ChangedOnly');
            }
          }}
        >
          <path
            className={`marks ${classes.movedLine}`}
            d={createComet(5, 25, 5, 5)}
            style={{ opacity: '0.4' }}
          />
          {dataDisplay === 'ChangedOnly' ? (
            <rect height={25} opacity=".2" rx={20} transform={translate(-10, -8)} width={130} />
          ) : null}
          <circle className={`marks ${classes.movedPoint}`} cx={5} cy={5} opacity=".2" r="5" />
          <circle className={`marks ${classes.movedPoint}`} cx={25} cy={5} opacity="1" r="5" />
          <text dominantBaseline="middle" dx="32" dy="5">
            Point Moved
          </text>
        </g>
        <g
          transform={translate(510, 10)}
          onMouseDown={() => {
            if (dataDisplay === 'Diff') {
              setDataDisplay('All');
            } else {
              setDataDisplay('Diff');
            }
          }}
        >
          {dataDisplay === 'Diff' ? (
            <rect height={25} opacity=".2" rx={20} transform={translate(14, -8)} width={130} />
          ) : null}
          <text dominantBaseline="middle" dx="32" dy="5">
            All Changed Data
          </text>
        </g>
      </g>
    </svg>
  );
};

export default observer(Legend);
