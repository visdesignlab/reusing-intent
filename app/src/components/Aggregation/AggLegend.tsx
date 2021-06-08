import { observer } from 'mobx-react';
import React, { FC, useContext } from 'react';

import translate from '../../Utils/Translate';
import Store from '../../Store/Store';


type Props = {
  offset?: number;
};

const Legend: FC<Props> = ({ offset = 0 }: Props) => {
    const {
        exploreStore: { state },
    } = useContext(Store);

    const agg = state.aggregate ? Object.keys(state.aggregate) : null
    console.log(state.aggregate);

    if(!agg)
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
      <>
        <g transform={translate(offset, -10)}>
          {agg.map((point, i) => {
            return (
                <g key={point} transform={translate(0, i * 20)}>
                    <circle
                        fill={colors[i]}
                        id={`mark${point}`}
                        opacity="1"
                        r="5"
                    />
                    <text dominantBaseline="middle" dx="10">
                        {point}
                    </text>
                </g>

            );
          })}
        </g>
      </>
    );
};

export default observer(Legend);
