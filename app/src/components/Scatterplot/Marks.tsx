import { Box, Tooltip } from '@material-ui/core';
import clsx from 'clsx';
import { ScaleLinear, symbol, SymbolType } from 'd3';
import { observer } from 'mobx-react';
import { FC, useContext, useMemo } from 'react';

import { CategoryContext } from '../../contexts/CategoryContext';
import translate from '../../utils/transform';
import { BrushSelections } from '../Brushes/Rectangular Brush/Components/BrushComponent';

import { ScatterplotPoint } from './Scatterplot';
import useScatterplotStyle from './styles';

type Props = {
  datapoints: ScatterplotPoint[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  freeformSelections: string[];
  brushSelections: BrushSelections;
  symbolMap: { [key: string]: SymbolType } | null;
};

const Marks: FC<Props> = ({
  datapoints,
  freeformSelections,
  brushSelections,
  xScale,
  yScale,
  symbolMap,
}) => {
  const classes = useScatterplotStyle();

  // Maybe get as prop
  const { hoveredCategory = null } = useContext(CategoryContext) || {};

  // Hack behaviour to combine
  const selectedPoints: string[] = useMemo(() => {
    const sels: string[] = [...freeformSelections];

    Object.values(brushSelections).forEach((s) => sels.push(...s));

    return [...new Set(sels)];
  }, [freeformSelections, brushSelections]);

  const cls = (point: ScatterplotPoint) => {
    return clsx('marks', {
      [classes.unionMark]: selectedPoints.includes(point.id),
      [classes.regularMark]: !selectedPoints.includes(point.id),
      [classes.dullMark]: hoveredCategory !== null && hoveredCategory !== point.category,
    });
  };

  const mark = (point: ScatterplotPoint) =>
    symbolMap ? (
      <path
        className={cls(point)}
        d={symbol(symbolMap[point.category || '-']).size(80)() || ''}
        id={`mark${point.id}`}
        opacity="0.5"
        transform={translate(xScale(point.x), yScale(point.y))}
      />
    ) : (
      <circle
        className={cls(point)}
        cx={xScale(point.x)}
        cy={yScale(point.y)}
        id={`mark${point.id}`}
        opacity="0.5"
        r="5"
      />
    );

  return (
    <>
      {datapoints.map((point) => {
        return (
          // <Tooltip key={point.id} title={point.tooltip ? point.tooltip : point.label}>
          <Tooltip
            key={point.id}
            title={
              <Box>
                <pre>{JSON.stringify(point, null, 2)}</pre>
              </Box>
            }
          >
            {mark(point)}
          </Tooltip>
        );
      })}
    </>
  );
};

export default observer(Marks);
