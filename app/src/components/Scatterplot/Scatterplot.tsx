/* eslint-disable @typescript-eslint/no-unused-vars */
import { createStyles, makeStyles, useTheme } from '@material-ui/core';
import { extent, select, SymbolType } from 'd3';
import { observer } from 'mobx-react';
import { useCallback, useMemo } from 'react';

import useScale from '../../hooks/useScale';
import { ScatterplotSpec } from '../../types/Interactions';
import translate from '../../utils/transform';
import FreeFormBrush, { FreeformBrushAction, FreeformBrushEvent } from '../Brushes/FreeFormBrush';
import BrushComponent, {
  BrushSelections,
} from '../Brushes/Rectangular Brush/Components/BrushComponent';
import { BrushAffectType, BrushCollection } from '../Brushes/Rectangular Brush/Types/Brush';

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

export type ScatterplotPoint = {
  id: string;
  label: string;
  x: number;
  y: number;
  category?: string;
  tooltip?: string | JSX.Element;
};

export type SPView = ScatterplotSpec & {
  freeformSelections: string[];
  brushes: BrushCollection;
  brushSelections: { [key: string]: string[] };
};

type Props = {
  view: SPView;
  points: ScatterplotPoint[];
  size: number;
  xAxisLabel: string | JSX.Element | ((x_col: string) => string | JSX.Element);
  yAxisLabel: string | JSX.Element | ((y_col: string) => string | JSX.Element);
  margin?: number;
  showCategories: boolean;
  categoryMap?: { [key: string]: SymbolType } | null;
  freeformBrushHandler: (
    points: string[],
    spec: ScatterplotSpec,
    action: FreeformBrushAction,
  ) => void;
  rectangularBrushHandler: (
    spec: ScatterplotSpec,
    brushes: BrushCollection,
    type: BrushAffectType,
    affectedBrushId: string,
  ) => void;
  selections: string[];
};

const Scatterplot = ({
  view,
  size,
  margin = 0,
  xAxisLabel,
  yAxisLabel,
  points,
  freeformBrushHandler,
  showCategories,
  categoryMap = null,
  rectangularBrushHandler,
}: Props) => {
  // Calculate Dimensions
  const theme = useTheme();
  const plotSize = size - 2 * theme.spacing(1) - 2;
  const dimension = plotSize - 2 * margin;
  const styles = useStyles({ dimension: plotSize });
  const scatterplotStyles = useScatterplotStyle();
  // Dimensions Calculated

  // Get Scales
  const { x_extents, y_extents } = useMemo(() => {
    if (points.length === 0)
      return { x_extents: [0, 0] as [number, number], y_extents: [0, 0] as [number, number] };
    const x_extents = extent(points.map((d) => d.x)) as [number, number];
    const y_extents = extent(points.map((d) => d.y)) as [number, number];

    return { x_extents, y_extents };
  }, [points]);

  const xScale = useScale(x_extents, [0, dimension]);
  const yScale = useScale(y_extents, [dimension, 0]);
  // Scales Complete

  // Freeform Brush
  const _freeformBrushHandler = useCallback(
    (affectedPoints: string[], event: FreeformBrushEvent, action: FreeformBrushAction) => {
      if (affectedPoints.length === 0) return;
      const selectorString = affectedPoints.map((p) => `#mark${p}`).join(',');

      const isSelecting = action === 'Selection';

      switch (event) {
        case 'Start':
        case 'Brushing':
          select(`#${view.id}`)
            .selectAll(selectorString)
            .filter(function () {
              return select(this).classed(
                isSelecting ? scatterplotStyles.regularMark : scatterplotStyles.unionMark,
              );
            })
            .classed(scatterplotStyles.intermittentHighlight, true);
          break;
        case 'End':
          select(`#${view.id}`)
            .selectAll('.marks')
            .classed(scatterplotStyles.intermittentHighlight, false);
          freeformBrushHandler(affectedPoints, view, action);
          break;
      }
    },
    [scatterplotStyles, freeformBrushHandler, view],
  );
  // Freeform Done

  // Rectangular Brush
  const _rectBrushHandler = useCallback(
    (
      _selections: BrushSelections,
      brushes: BrushCollection,
      type: BrushAffectType,
      affectedId: string,
    ) => {
      rectangularBrushHandler(view, brushes, type, affectedId);
    },
    [rectangularBrushHandler, view],
  );
  // Rectangular Done

  if (showCategories && !categoryMap) throw new Error('Categories not defined');

  return (
    <svg className={styles.root} id={view.id}>
      <defs>
        <clipPath id="clip" width={dimension}>
          <rect fill="none" height={dimension} width={dimension} />
        </clipPath>
      </defs>
      <g transform={translate(margin)}>
        <FreeFormBrush
          bottom={dimension}
          brushSize={20}
          data={points}
          left={0}
          right={dimension}
          top={0}
          xScale={xScale}
          yScale={yScale}
          onBrush={_freeformBrushHandler}
        />
        <BrushComponent
          bottom={dimension}
          brushes={view.brushes}
          data={points}
          left={0}
          right={dimension}
          top={0}
          xScale={xScale}
          yScale={yScale}
          onBrushHandler={_rectBrushHandler}
        />
        <Axis
          label={typeof xAxisLabel === 'function' ? xAxisLabel(view.x) : xAxisLabel}
          margin={margin}
          scale={xScale}
          transform={translate(0, dimension)}
          type="bottom"
        />
        <Axis
          label={typeof yAxisLabel === 'function' ? yAxisLabel(view.y) : yAxisLabel}
          margin={margin}
          scale={yScale}
          transform={translate(0)}
          type="left"
        />
        <Marks
          brushSelections={view.brushSelections}
          datapoints={points}
          freeformSelections={view.freeformSelections}
          symbolMap={showCategories ? categoryMap : null}
          xScale={xScale}
          yScale={yScale}
        />
      </g>
    </svg>
  );
};

export default observer(Scatterplot);
