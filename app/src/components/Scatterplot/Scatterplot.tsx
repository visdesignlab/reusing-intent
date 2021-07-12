/* eslint-disable @typescript-eslint/no-unused-vars */
import { createStyles, makeStyles, useTheme, Fade, Paper, Popper, Typography, Dialog, DialogContent, TextField, DialogActions, Button } from '@material-ui/core';
import { select } from 'd3';
import { observer } from 'mobx-react';
import React, { FC, useCallback, useContext, useState } from 'react';

import { ExtendedBrushCollection } from '../../Store/IntentState';
import Store from '../../Store/Store';
import { Plot, SPlot } from '../../Store/Types/Plot';
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
import SkylineLegend from './Overlay/SkylineLegend';
import useScatterplotStyle from './styles';
import LabelMarks from './LabelMarks';

const useStyles = makeStyles(() =>
  createStyles({
    root: (props: { dimension: number }) => ({
      width: props.dimension,
      height: props.dimension,
    }),
  }),
);

type ReferenceObject = {
  clientHeight: number;
  clientWidth: number;

  getBoundingClientRect(): ClientRect;
}

type Props = {
  plot: Plot;
  size: number;
  originalMarks?: boolean;
  dataDisplay?: DataDisplay;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setDataDisplay?: any;
};

const Scatterplot: FC<Props> = ({
  plot,
  size,
  originalMarks = true,
  dataDisplay = 'Original',
}: Props) => {
  const theme = useTheme();
  const [labelPopupOpen, setLabelPopupOpen] = useState(false)
  const [labelName, setLabelName] = useState("");
  const [currentPoints, setCurrentPoints] = useState<string[]>([]);
  const [anchorEl, setAnchorEl] = useState<ReferenceObject | null>(null);
  const dimension = size - 2 * theme.spacing(1);
  const { root } = useStyles({ dimension });
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    loadedDataset: { labelColumn },
    setFreeformSelection,
    selectedPoints,
    showMatchesLegend,
    setBrushSelection,
    label,
    brushType,
    hoveredPrediction,
    showSkylineLegend,
    state,
    activeTool,
  } = useContext(Store).exploreStore;

  const { selectedPointsComparison } = useContext(Store).compareStore;

  const { x, y } = plot as SPlot;

  const classes = useScatterplotStyle();

  const { points, x_extents, y_extents } = useScatterplotData(x, y, labelColumn, false);
  const { points: compPoints } = useScatterplotData(x, y, labelColumn, true);

  const margin = theme.spacing(10);
  const sp_dimension = dimension - 2 * margin;

  const xScale = useScale(x_extents, [0, sp_dimension]);
  const yScale = useScale(y_extents, [sp_dimension, 0]);

  const freeFormBrushHandler = useCallback(
    (points: string[], eve: FreeformBrushEvent, _: FreeformBrushAction) => {
      if (points.length === 0) return;
      const selectorString = points.map((p) => `#mark${p}`).join(',');

      setCurrentPoints(points)

      switch (eve) {
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

          if(activeTool === "Label")
          {
            setLabelPopupOpen(true)
          }
          else{
            select(`#${plot.id}`)
              .selectAll('.marks')
              .classed(classes.intermittentHighlight, false);

            setFreeformSelection(plot, points);
          }
          break;
      }
    },
    [plot, setFreeformSelection, classes, activeTool],
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
    <div>
      <Popper
        anchorEl={anchorEl}
        open={labelPopupOpen}
        placement="right"
        style={{ maxWidth: 225, margin: 15 }}
        transition
      >
        <Paper variant="outlined">
          <TextField
            autoComplete="off"
            id="name"
            label="Label Name"
            margin="dense"
            type="email"
            autoFocus
            fullWidth
            onChange={(e) => setLabelName(e.target.value)}
          />
          <Button
            color="primary"
            onClick={() => {
              setLabelPopupOpen(false);

              select(`#${plot.id}`)
                .selectAll('.marks')
                .classed(classes.intermittentHighlight, false);
            }}
          >
            Cancel
          </Button>
          <Button
            color="primary"
            onClick={() => {
              label(labelName, currentPoints);

              setLabelPopupOpen(false);

              select(`#${plot.id}`)
                .selectAll('.marks')
                .classed(classes.intermittentHighlight, false);
            }}
          >
            Add Label to Nodes
          </Button>
        </Paper>
      </Popper>
      <svg className={root} id={plot.id}>
        <defs>
          <clipPath id="clip" width={sp_dimension}>
            <rect fill="none" height={sp_dimension} width={sp_dimension} />
          </clipPath>
        </defs>
        <g
          transform={translate(margin)}
          onMouseUp={(event: React.MouseEvent<SVGElement, MouseEvent>) => {
            console.log(event.target);
            console.log(event.clientX, event.clientY);
            setAnchorEl({
              clientWidth: 5,
              clientHeight: 5,
              getBoundingClientRect: () => {
                return {
                  bottom: 30 + event.clientY + 5,
                  left: 20 + event.clientX,
                  top: 30 + event.clientY,
                  height: 5,
                  right: 20 + event.clientX + 5,
                  width: 5,
                };
              },
            });
          }}
        >
          <Axis
            columnName={x}
            scale={xScale}
            transform={translate(0, sp_dimension)}
            type="bottom"
          />
          <Axis columnName={y} scale={yScale} type="left" />
          {showMatchesLegend && <Legend offset={sp_dimension - 110} />}

          {showSkylineLegend && <SkylineLegend transform={translate(sp_dimension - 150, 100)} />}
          <BrushComponent
            bottom={sp_dimension}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            brushes={state.brushes[plot.id] || {}}
            data={points}
            disableBrush={brushType !== 'Rectangular' || !originalMarks}
            left={0}
            right={sp_dimension}
            top={0}
            xScale={xScale}
            yScale={yScale}
            onBrushHandler={rectBrushHandler}
          />
          {brushSize && originalMarks && (
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

          {originalMarks ? (
            activeTool === 'Label' ? (
              <LabelMarks
                points={points}
                selectedPoints={selectedPoints}
                xScale={xScale}
                yScale={yScale}
              />
            ) : (
              <Marks
                points={points}
                selectedPoints={selectedPoints}
                xScale={xScale}
                yScale={yScale}
              />
            )
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
          {hoveredPrediction && (
            <Overlay prediction={hoveredPrediction} xScale={xScale} yScale={yScale} />
          )}
          {state.prediction && (
            <Overlay prediction={state.prediction} xScale={xScale} yScale={yScale} />
          )}
        </g>
      </svg>
    </div>
  );
};

export default observer(Scatterplot);
