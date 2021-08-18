import { Box, Tooltip } from '@material-ui/core';
import clsx from 'clsx';
import { ScaleLinear, symbol, SymbolType } from 'd3';
import { observer } from 'mobx-react';
import { FC, useContext, useMemo } from 'react';

import { GlobalPlotAttributeContext } from '../../contexts/CategoryContext';
import { ColorPredicate, CUSTOM_LABEL, HighlightPredicate } from '../../stores/ExploreStore';
import { useStore } from '../../stores/RootStore';
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
  highlightMode?: boolean;
  highlightPredicate?: HighlightPredicate | null;
  colorPredicate?: ColorPredicate | null;
  type?: 'Regular' | 'Aggregate';
};

const Marks: FC<Props> = ({
  datapoints,
  freeformSelections,
  brushSelections,
  xScale,
  yScale,
  symbolMap,
  type = 'Regular',
  highlightMode = false,
  highlightPredicate = null,
  colorPredicate = null,
}) => {
  const classes = useScatterplotStyle();

  const {
    exploreStore: { showLabelLayer, setHighlightMode, setHighlightPredicate, state },
  } = useStore();

  // Maybe get as prop
  const { labelMap = {} } = useContext(GlobalPlotAttributeContext) || {};

  // Hack behaviour to combine
  const selectedPoints: string[] = useMemo(() => {
    const sels: string[] = [...freeformSelections];

    Object.values(brushSelections).forEach((s) => sels.push(...s));

    return [...new Set(sels)];
  }, [freeformSelections, brushSelections]);

  const cls = (point: ScatterplotPoint, color = 'NA') => {
    const cope = colorPredicate !== null ? colorPredicate(point) : '';

    return clsx('marks', {
      [classes.unionMark]: selectedPoints.includes(point.id),
      [classes.regularMark]: !selectedPoints.includes(point.id),
      [classes.dullMark]:
        highlightMode && highlightPredicate !== null && !highlightPredicate(point),
      [color]: color !== 'NA',
      [cope]: colorPredicate !== null,
    });
  };

  const mark = (point: ScatterplotPoint, color: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fieldProps: any = {};

    if (type === 'Aggregate') {
      fieldProps['onMouseEnter'] = () => {
        setHighlightMode(true);
        setHighlightPredicate((p) => {
          const { aggregates } = state;

          const currAgg = aggregates[point.id];

          const members = currAgg.values;

          return members.includes(p.id);
        });
      };
      fieldProps['onMouseLeave'] = () => {
        setHighlightMode(false);
        setHighlightPredicate(null);
      };
    }

    return symbolMap ? (
      <path
        className={cls(point, color)}
        d={symbol(symbolMap[point.category || '-']).size(type === 'Aggregate' ? 100 : 80)() || ''}
        id={`mark${point.id}`}
        opacity="0.5"
        transform={translate(xScale(point.x), yScale(point.y))}
        {...fieldProps}
      />
    ) : (
      <circle
        className={cls(point, color)}
        cx={xScale(point.x)}
        cy={yScale(point.y)}
        id={`mark${point.id}`}
        opacity="0.5"
        r={type === 'Aggregate' ? 10 : 5}
        {...fieldProps}
      />
    );
  };

  return (
    <>
      {datapoints.map((point) => {
        const label = (point[CUSTOM_LABEL] || [])[0];

        let color = 'NA';

        if (showLabelLayer) color = labelMap[label];

        return (
          // <Tooltip key={point.id} title={point.tooltip ? point.tooltip : point.label}>
          <Tooltip
            key={point.id}
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
            {mark(point, color)}
          </Tooltip>
        );
      })}
    </>
  );
};

export default observer(Marks);
