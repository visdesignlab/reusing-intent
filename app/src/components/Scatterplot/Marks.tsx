import { Tooltip } from '@material-ui/core';
import clsx from 'clsx';
import { ScaleLinear, symbol, SymbolType } from 'd3';
import { observer } from 'mobx-react';
import { FC, useMemo } from 'react';

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

  // Hack behaviour to combine
  const selectedPoints: string[] = useMemo(() => {
    const sels: string[] = [...freeformSelections];

    Object.values(brushSelections).forEach((s) => sels.push(...s));

    return [...new Set(sels)];
  }, [freeformSelections, brushSelections]);

  const mark = (point: ScatterplotPoint) =>
    symbolMap ? (
      <path
        className={clsx('marks', {
          [classes.unionMark]: selectedPoints.includes(point.id),
          [classes.regularMark]: !selectedPoints.includes(point.id),
        })}
        d={symbol(symbolMap[point.category || '-']).size(80)() || ''}
        opacity="0.5"
        transform={translate(xScale(point.x), yScale(point.y))}
      />
    ) : (
      <circle
        className={clsx('marks', {
          [classes.unionMark]: selectedPoints.includes(point.id),
          [classes.regularMark]: !selectedPoints.includes(point.id),
        })}
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
          <Tooltip key={point.id} title={point.tooltip ? point.tooltip : point.label}>
            {mark(point)}
          </Tooltip>
        );
      })}
    </>
  );
};

export default observer(Marks);
