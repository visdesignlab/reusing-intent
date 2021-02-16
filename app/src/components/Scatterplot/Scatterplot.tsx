import { createStyles, makeStyles, useTheme } from '@material-ui/core';
import { select } from 'd3';
import { observer } from 'mobx-react';
import React, { FC, useCallback, useContext } from 'react';

import { ExtendedBrushCollection } from '../../Store/IntentState';
import Store from '../../Store/Store';
import { Plot } from '../../Store/Types/Plot';
import translate from '../../Utils/Translate';
import BrushComponent, { BrushSelections } from '../Brush/Components/BrushComponent';
import { BrushAffectType, BrushCollection } from '../Brush/Types/Brush';
import ComparisonMarks from '../Comparison/ComparisonMarks';
import { DataDisplay } from '../Comparison/ComparisonScatterplot';
import FreeFormBrush, {
  BrushSize,
  FreeformBrushAction,
  FreeformBrushEvent,
} from '../Freeform/FreeFormBrush';
import { useScale } from '../Hooks/useScale';
import { useScatterplotData } from '../Hooks/useScatterplot';

import Axis from './Axis';
import Legend from './Legend';
import Marks from './Marks';
import Overlay from './Overlay/Overlay';
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
  originalMarks?: boolean;
  dataDisplay?: DataDisplay;
};

const Scatterplot: FC<Props> = ({
  plot,
  size,
  originalMarks = true,
  dataDisplay = 'Original',
}: Props) => {
  const theme = useTheme();
  const dimension = size - 2 * theme.spacing(1);
  const { root } = useStyles({ dimension });
  const {
    loadedDataset: { labelColumn },
    setFreeformSelection,
    selectedPoints,

    showMatchesLegend,
    setBrushSelection,
    state: { brushType },
    hoveredPrediction,
  } = useContext(Store).exploreStore;

  const { selectedPointsComparison } = useContext(Store).compareStore;

  const { x, y } = plot;

  const classes = useScatterplotStyle();

  const { points, x_extents, y_extents } = useScatterplotData(x, y, labelColumn, false);
  const { points: compPoints } = useScatterplotData(x, y, labelColumn, true);

  const margin = theme.spacing(10);
  const sp_dimension = dimension - 2 * margin;

  const xScale = useScale(x_extents, [0, sp_dimension]);
  const yScale = useScale(y_extents, [sp_dimension, 0]);

  const freeFormBrushHandler = useCallback(
    (points: string[], event: FreeformBrushEvent, _: FreeformBrushAction) => {
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

  const rectBrushHandler = useCallback(
    (
      selection: BrushSelections,
      brushes: BrushCollection,
      type: BrushAffectType,
      affectedId: string,
    ) => {
      const brs: ExtendedBrushCollection = {};

      Object.entries(brushes).forEach((entry) => {
        const [id, val] = entry;

        brs[id] = { ...val, points: selection[id] };
      });

      setBrushSelection(plot, brs, type, affectedId);
    },
    [plot, setBrushSelection],
  );

  let brushSize: BrushSize | null = null;

  switch (brushType) {
    case 'Freeform Small':
      brushSize = 20;
      break;
    case 'Freeform Medium':
      brushSize = 35;
      break;
    case 'Freeform Large':
      brushSize = 50;
      break;
    default:
      brushSize = null;
  }

  return (
    <svg className={root} id={plot.id}>
      <g transform={translate(margin)}>
        <Axis columnName={x} scale={xScale} transform={translate(0, sp_dimension)} type="bottom" />
        <Axis columnName={y} scale={yScale} type="left" />
        {showMatchesLegend && <Legend offset={sp_dimension - 110} />}
        <BrushComponent
          bottom={sp_dimension}
          brushes={plot.brushes}
          data={points}
          disableBrush={brushType !== 'Rectangular'}
          left={0}
          right={sp_dimension}
          top={0}
          xScale={xScale}
          yScale={yScale}
          onBrushHandler={rectBrushHandler}
        />
        {brushSize && (
          <FreeFormBrush
            bottom={sp_dimension}
            brushSize={brushSize}
            data={points}
            left={0}
            right={sp_dimension}
            top={0}
            xScale={xScale}
            yScale={yScale}
            onBrush={freeFormBrushHandler}
          />
        )}
        {hoveredPrediction && <Overlay prediction={hoveredPrediction} />}
        {originalMarks ? (
          <Marks points={points} selectedPoints={selectedPoints} xScale={xScale} yScale={yScale} />
        ) : (
          <ComparisonMarks
            compPoints={compPoints}
            dataDisplay={dataDisplay}
            points={points}
            selectedPoints={selectedPointsComparison}
            xScale={xScale}
            yScale={yScale}
          />
        )}
      </g>
    </svg>
  );
};

export default observer(Scatterplot);
