import { Box, Tooltip } from '@material-ui/core';
import clsx from 'clsx';
import { ScaleLinear, symbol, symbolCircle, symbolCross, symbolTriangle, SymbolType } from 'd3';
import { observer } from 'mobx-react';
import { useCallback, useMemo } from 'react';

import { HighlightPredicate } from '../../stores/ExploreStore';
import { useStore } from '../../stores/RootStore';
import translate from '../../utils/transform';

import { ScatterplotPoint } from './Scatterplot';
import useScatterplotStyle from './styles';

type Props = {
  dataPoints: ScatterplotPoint[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  highlightMode?: boolean;
  highlightPredicate?: HighlightPredicate | null;
  type?: 'Regular' | 'Aggregate';
};

const CompareMarks = ({
  dataPoints,
  xScale,
  yScale,
  type,
  highlightMode,
  highlightPredicate,
}: Props) => {
  const styles = useScatterplotStyle();

  const {
    exploreStore: {
      changes: { added, removed, updated, updateMap, results },
      // dataset_id, compareTarget
    },
  } = useStore();

  const dp = useMemo(() => {
    const dp: { [id: string]: ScatterplotPoint } = {};

    dataPoints.forEach((point) => {
      dp[point.iid] = point;
    });

    return dp;
  }, [dataPoints]);

  const changePoints = useMemo(() => {
    const points: {
      [id: string]: {
        source: ScatterplotPoint;
        target: ScatterplotPoint;
      };
    } = {};

    updateMap.forEach(({ id, source, target }) => {
      points[id] = {
        source: dp[source],
        target: dp[target],
      };
    });

    return Object.values(points);
  }, [dp, updateMap]);

  const lines = changePoints.map(({ source, target }) => {
    const cls = [styles.movedLine];

    if (results.includes(source.id)) {
      cls.push(styles.unionMark);
    }

    if (highlightMode && highlightPredicate) {
      if (!highlightPredicate(source)) {
        cls.push(styles.forceDullMark);
      }
    }

    return (
      <path
        key={source.id}
        className={clsx(cls)}
        d={createComet(xScale(source.x), xScale(target.x), yScale(source.y), yScale(target.y))}
      />
    );
  });

  const mark = useCallback(
    (point: ScatterplotPoint) => {
      let sym: SymbolType = symbolCircle;
      const cls = [];

      let transform = translate(xScale(point.x), yScale(point.y));

      if (results.includes(point.id)) {
        cls.push(styles.unionMark);
      }

      if (added.includes(point.id)) {
        cls.push(styles.newMark);
        sym = symbolTriangle;
      } else if (removed.includes(point.id)) {
        cls.push(styles.removedMark);
        sym = symbolCross;
        transform = `${transform}rotate(45)`;
      } else if (updated.includes(point.id)) {
        cls.push(styles.movedPoint);
      } else {
        cls.push(styles.dullMark);
      }

      if (highlightMode && highlightPredicate) {
        if (!highlightPredicate(point)) {
          cls.push(styles.forceDullMark);
        }
      }

      return (
        <path
          className={clsx(cls)}
          d={
            symbol()
              .type(sym)
              .size(type === 'Regular' ? 80 : 100)() || ''
          }
          id={`mark${point.id}`}
          transform={transform}
        />
      );
    },
    [
      added,
      removed,
      styles,
      results,
      type,
      xScale,
      yScale,
      updated,
      highlightMode,
      highlightPredicate,
    ],
  );

  return (
    <>
      {lines}
      {dataPoints.map((point) => {
        return (
          // <Tooltip key={point.id} title={point.tooltip ? point.tooltip : point.label}>
          <Tooltip
            key={point.iid}
            title={
              type === 'Regular' ? (
                <Box>
                  <pre>{JSON.stringify(point, null, 2)}</pre>
                </Box>
              ) : (
                ''
              )
            }
          >
            {mark(point)}
          </Tooltip>
        );
      })}
    </>
  );
};

export default observer(CompareMarks);

export function createComet(x1: number, x2: number, y1: number, y2: number): string {
  const theta = Math.atan((x1 - x2) / (y1 - y2));

  const xLength = 4.5 * Math.cos(theta);
  const yLength = 4.5 * Math.sin(theta);

  return `M ${x2 + xLength} ${y2 - yLength} 
  L ${x1} ${y1} 
  L ${x2 - xLength} ${y2 + yLength}
  z`;
}
