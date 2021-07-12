/* eslint-disable @typescript-eslint/no-unused-vars */
import { observer } from 'mobx-react';
import React, { useContext, FC, useCallback } from 'react';
import { toJS } from 'mobx';
import { useTheme } from '@material-ui/core';

import Axis from '../Scatterplot/Axis';
import translate from '../../Utils/Translate';
import Store from '../../Store/Store';
import { usePCPData } from '../Hooks/usePCP';
import { useScale, usePCPScales } from '../Hooks/useScale';
import BrushComponent, { BrushSelections } from '../Brush/Components/BrushComponent';
import { BrushCollection, BrushAffectType } from '../Brush/Types/Brush';
import { ExtendedBrushCollection } from '../../Store/IntentState';
import { Plot } from '../../Store/Types/Plot';

import Lines from './Lines';
import PCPAxis from './PcpAxis'


type Props = {
  size: number;
  plot: Plot,
};

const PcpVis: FC<Props> = ({ size = 800, plot }: Props) => {
    // const xScale = useScale(x_extents, [0, sp_dimension]);
    // const yScale = useScale(y_extents, [sp_dimension, 0]);
    const theme = useTheme();

    const dimension = size - 2 * theme.spacing(1);

    const margin = theme.spacing(10);
    const pcp_dimension = dimension - 2 * margin;

    const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
        loadedDataset, setBrushSelection, state
    } = useContext(Store).exploreStore;

    const { all_extents, lines, allLabels } = usePCPData();

    const allScales = usePCPScales(allLabels, all_extents, [pcp_dimension, 0]);

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
            {/* <BrushComponent
              bottom={pcp_dimension}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              brushes={state.brushes[plot.id] || {}}
              data={points}
              left={0}
              right={sp_dimension}
              top={0}
              xScale={xScale}
              yScale={yScale}
              onBrushHandler={rectBrushHandler}
            /> */}
          </g>
          <Lines allScales={allScales} pcp_dimension={pcp_dimension} points={lines} />
        </svg>
      </div>
    );


}

export default observer(PcpVis);
