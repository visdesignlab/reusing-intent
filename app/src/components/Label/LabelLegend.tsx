import { observer } from 'mobx-react';
import React, { FC, useContext } from 'react';

import translate from '../../Utils/Translate';
import Store from '../../Store/Store';


type Props = {
  offset?: number;
};

const Legend: FC<Props> = () => {
    const {
        exploreStore: { state },
    } = useContext(Store);

    const label = state.label ? Object.keys(state.label) : null

    if(!label)
    {
        return null
    }
    
  const colors = [
    '#4e79a7',
    '#76b7b2',
    '#59a14f',
    '#edc949',
    '#af7aa1',
    '#ff9da7',
    '#9c755f',
    '#bab0ab',
    '#f28e2c',
    '#e15759',
  ];
    
    return (
        <svg height={30} width={700}>
          <g transform={translate(0, 0)}>
            {label.map((point, i) => {
              return (
                <g key={point} transform={translate(100 + i * 100, 20)}>
                  <circle fill={colors[i]} id={`mark${point}`} opacity=".5" r="5" />
                  <text dominantBaseline="middle" dx="10">
                    {point.length < 12 ? point : point.slice(0, 12) + ".."}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
    );
};

export default observer(Legend);
