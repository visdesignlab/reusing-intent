import { createStyles, makeStyles, useTheme } from '@material-ui/core';
import { select } from 'd3';
import { observer } from 'mobx-react';
import React, { FC, useCallback, useContext } from 'react';

import { Plot } from '../../Store/Plot';
import IntentStore from '../../Store/Store';
import translate from '../../Utils/Translate';
import FreeFormBrush, { FreeformBrushAction, FreeformBrushEvent } from '../Freeform/FreeFormBrush';
import { useScale } from '../Hooks/useScale';
import { useScatterplotData } from '../Hooks/useScatterplot';

import Axis from './Axis';
import Marks from './Marks';
import useScatterplotStyle from './styles';

const useStyles = makeStyles(() =>
  createStyles({
    root: (props: { dimension: number }) => ({
      width: props.dimension,
      height: props.dimension,
    }),
  }),
);

type Props = {
  plot: Plot;
  size: number;
};

const Scatterplot: FC<Props> = ({ plot, size }: Props) => {
  const theme = useTheme();
  const dimension = size - 2 * theme.spacing(1);
  const { root } = useStyles({ dimension });
  const {
    dataset: { labelColumn },
    setFreeformSelection,
    selectedPoints,
  } = useContext(IntentStore);

  const { x, y } = plot;

  const classes = useScatterplotStyle();

  const { points, x_extents, y_extents } = useScatterplotData(x, y, labelColumn);

  const margin = theme.spacing(10);
  const sp_dimension = dimension - 2 * margin;

  const xScale = useScale(x_extents, [0, sp_dimension]);
  const yScale = useScale(y_extents, [sp_dimension, 0]);

  const freeFormBrushHandler = useCallback(
    (points: number[], event: FreeformBrushEvent, _: FreeformBrushAction) => {
      if (points.length === 0) return;
      const selectorString = points.map((p) => `#mark${p}`).join(',');

      switch (event) {
        case 'Start':
        case 'Brushing':
          select(`#${plot.id}`)
            .selectAll(selectorString)
            .filter(function () {
              return select(this).classed(classes.regularMark);
            })
            .classed(classes.intermittentHighlight, true);
          break;
        case 'End':
          select(`#${plot.id}`).selectAll('.marks').classed(classes.intermittentHighlight, false);
          setFreeformSelection(plot, points);
          break;
      }
    },
    [plot, setFreeformSelection, classes],
  );

  // const onRectBrush = useCallback(
  //   (brush: Brush) => {
  //     const { brushes } = plot;
  //     brushes[brush.id] = brush as any;
  //     setBrush(plot, brushes);
  //   },
  //   [plot, setBrush],
  // );

  return (
    <svg className={root} id={plot.id}>
      <g transform={translate(margin)}>
        <Axis columnName={x} scale={xScale} transform={translate(0, sp_dimension)} type="bottom" />
        <Axis columnName={y} scale={yScale} type="left" />
        <Marks points={points} selectedPoints={selectedPoints} xScale={xScale} yScale={yScale} />
        <FreeFormBrush
          bottom={sp_dimension}
          data={points as any}
          left={0}
          right={sp_dimension}
          top={0}
          xScale={xScale}
          yScale={yScale}
          onBrush={freeFormBrushHandler}
        />
        {/* <BrushComponent
          bottom={sp_dimension}
          brushes={plot.brushes}
          left={0}
          right={sp_dimension}
          top={0}
          onBrush={onRectBrush}
          // onBrushUpdate={(brushes, affectedBrush, affectType) => {
          //   console.log(brushes, affectedBrush, affectType);
          // }}
        /> */}
      </g>
    </svg>
  );
};

export default observer(Scatterplot);
