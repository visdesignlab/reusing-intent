/* eslint-disable @typescript-eslint/no-unused-vars */
import { createStyles, makeStyles, useTheme } from '@material-ui/core';
import clsx from 'clsx';
import { line, select } from 'd3';
import { observer } from 'mobx-react';
import { useCallback } from 'react';

import { BrushSizeMap } from '../../stores/ExploreStore';
import { useStore } from '../../stores/RootStore';
import { PCPView } from '../../stores/ViewState';
import translate from '../../utils/transform';
import FreeFormBrush, { FreeformBrushAction, FreeformBrushEvent } from '../Brushes/FreeFormBrush';
import Axis from '../Scatterplot/Axis';
import useScatterplotStyle from '../Scatterplot/styles';

import { usePCP } from './usePCP';

const useStyles = makeStyles(() =>
  createStyles({
    root: (props: { height: number; width: number }) => ({
      width: props.width,
      height: props.height,
    }),
  }),
);

type Props = {
  size: number;
  margin?: number;
  view: PCPView;
};

const PCP = ({ size, margin = 30, view }: Props) => {
  const theme = useTheme();
  const plotSize = size - 2 * theme.spacing(1) - 2;
  const width = 900;
  const height = plotSize;
  const styles = useStyles({ height, width });
  const plotWidth = width - 2 * margin;
  const plotHeight = height - 2 * margin;
  const { dimensions } = view;
  const {
    exploreStore: {
      dataPoints,
      rangeMap,
      brushType,
      data,
      selectPointsFreeform,
      state: { selections },
    },
  } = useStore();
  const scatterplotStyles = useScatterplotStyle();

  const groupWidth = 40;

  const { attributeSpreadScale, attributeScales } = usePCP(
    dataPoints,
    dimensions,
    plotHeight,
    plotWidth,
    groupWidth,
    rangeMap,
  );

  const _freeformBrushHandler = useCallback(
    (points: string[], event: FreeformBrushEvent, action: FreeformBrushAction) => {
      if (points.length === 0) return;

      const selectorString = points.map((p) => `#mark${p}`).join(',');

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
          selectPointsFreeform(points, view);
          break;
      }
    },
    [scatterplotStyles, view, selectPointsFreeform],
  );

  if (!data) return <div>Loading</div>;

  const { columnInfo } = data;

  return (
    <svg className={styles.root} id={view.id}>
      <g transform={translate(margin)}>
        {dataPoints.map((point) => {
          const lineGen = line();
          const data = dimensions.map((dim) => {
            const x = attributeSpreadScale(dim) || 0;
            const y = attributeScales[dim](point[dim]);

            return [x, y] as [number, number];
          });

          return (
            <path
              key={point.id}
              className={clsx('marks', {
                [scatterplotStyles.regularLine]: !selections.includes(point.id),
                [scatterplotStyles.unionLine]: selections.includes(point.id),
              })}
              d={lineGen(data) || ''}
              fill="none"
              id={`mark${point.id}`}
              strokeWidth="1"
            />
          );
        })}
        {dimensions.map((dim) => {
          const column = columnInfo[dim];

          const points = dataPoints.map((point) => ({
            id: point.id,
            x: 0,
            y: point[dim],
          }));

          return (
            <g key={dim} transform={translate(attributeSpreadScale(dim) || 0, 0)}>
              {brushType !== 'Rectangular' && brushType !== 'None' && (
                <FreeFormBrush
                  bottom={plotHeight}
                  brushSize={BrushSizeMap[brushType]}
                  data={points}
                  left={0}
                  right={groupWidth}
                  top={0}
                  xScale={((d: number) => d) as any}
                  yScale={attributeScales[dim]}
                  onBrush={_freeformBrushHandler}
                />
              )}
              <Axis
                label={dim}
                margin={0}
                scale={attributeScales[dim]}
                showLabel={false}
                type="left"
              />
              <text textAnchor="middle" transform={translate(0, plotHeight + 20)}>
                <tspan>{column.fullname}</tspan>{' '}
                {column.unit && <tspan fontStyle="italic">({column.unit})</tspan>}
              </text>
              {dataPoints
                .sort(
                  (a, b) =>
                    (selections.includes(a.id) ? 1 : 0) - (selections.includes(b.id) ? 1 : 0),
                )
                .map((d) => (
                  <circle
                    key={d.id}
                    className={clsx('marks', {
                      [scatterplotStyles.regularMark]: !selections.includes(d.id),
                      [scatterplotStyles.unionMark]: selections.includes(d.id),
                    })}
                    cy={attributeScales[dim](d[dim])}
                    id={`mark${d.id}`}
                    opacity="0.5"
                    r="5"
                  />
                ))}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

export default observer(PCP);
