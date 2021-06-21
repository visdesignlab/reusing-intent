/* eslint-disable @typescript-eslint/no-unused-vars */
import { observer } from 'mobx-react';
import React, { useContext, FC } from 'react';
import { toJS } from 'mobx';
import { useTheme } from '@material-ui/core';

import Axis from '../Scatterplot/Axis';
import translate from '../../Utils/Translate';
import Store from '../../Store/Store';
import { usePCPData } from '../Hooks/usePCP';
import { useScale, usePCPScales } from '../Hooks/useScale';

import PCPAxis from './PcpAxis'
import Lines from './Lines';


type Props = {
  size: number;
};

const PcpVis: FC<Props> = ({ size = 800 }: Props) => {

    // const xScale = useScale(x_extents, [0, sp_dimension]);
    // const yScale = useScale(y_extents, [sp_dimension, 0]);
    const theme = useTheme();

    const dimension = size - 2 * theme.spacing(1);

    const margin = theme.spacing(10);
    const pcp_dimension = dimension - 2 * margin;

    const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
        loadedDataset
    } = useContext(Store).exploreStore;

    console.log(toJS(loadedDataset))

    const { all_extents, lines, allLabels } = usePCPData();

    const allScales = usePCPScales(allLabels, all_extents, [pcp_dimension, 0]);
    
    console.log(all_extents, lines, allLabels, allScales);

    return (
      <div>
        <svg height={size} width={size + 200}>
          <g>
            {all_extents.map((d: [number, number], i) => {
              return (
                <PCPAxis
                  key={allLabels[i]}
                  columnName={allLabels[i]}
                  scale={allScales[allLabels[i]]}
                  transform={translate(100 + i * 200, pcp_dimension / 4)}
                  type="left"
                />
              );
            })}
          </g>
          <Lines allScales={allScales} pcp_dimension={pcp_dimension} points={lines} />
        </svg>
      </div>
    );


}

export default observer(PcpVis);
