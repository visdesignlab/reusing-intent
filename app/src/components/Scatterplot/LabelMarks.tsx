import { Tooltip } from '@material-ui/core';
import clsx from 'clsx';
import { ScaleLinear } from 'd3';
import { observer } from 'mobx-react';
import React, { FC, useContext, useState } from 'react';

import Store from '../../Store/Store';

import useScatterplotStyle from './styles';

type Props = {
  points: { x: number; y: number; label: string; id: string }[];
  selectedPoints: string[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
};

const LabelMarks: FC<Props> = ({ points, selectedPoints, xScale, yScale }: Props) => {
  const [hoverLabeledNode, setHoverLabeledNode] = useState('');

  const {
    exploreStore: { hoveredPrediction, state },
  } = useContext(Store);

  const agg = state.aggregate;
  const lab = state.label;

  const labelNodes: { [key: string]: string } = {};
  let aggregatedNodes: string[] = [];

  const aggPoints: { x: number; y: number; label: string; id: string }[] = [];

  //finding what nodes are aggregated, and where the actual aggregated node should be located.
  //currently putting aggregated node at just the mean of all points, both x and y.
  for (const j in agg) {

    aggregatedNodes = agg[j].concat(aggregatedNodes);

    const xVals: number[] = [];
    const yVals: number[] = [];
    agg[j].forEach((d) => xVals.push(points.filter((p) => p.id === d)[0].x));
    agg[j].forEach((d) => yVals.push(points.filter((p) => p.id === d)[0].y));

    aggPoints.push({
      x: xVals.reduce((a, b) => a + b, 0) / xVals.length,
      y: yVals.reduce((a, b) => a + b, 0) / yVals.length,
      label: j,
      id: j,
    });
  }

  for (const [key, value] of Object.entries(lab)) {
    for (const j of value) {
      labelNodes[j] = key;
    }
  }

  const classes = useScatterplotStyle();
  const { matches: matchIds = [], isnp: isnpIds = [], ipns: ipnsIds = [] } =
    hoveredPrediction?.membership || {};

  const labelColorList = [
    classes.firstLabel,
    classes.secondLabel,
    classes.thirdLabel,
    classes.fourthLabel,
    classes.fifthLabel,
  ];

  return (
    <>
      {points
        .filter((d) => !aggregatedNodes.includes(d.id))
        .map((point) => {
          const labelColorIndex = Object.keys(lab).indexOf(labelNodes[point.id]);

          const myLabel = Object.keys(state.label).filter(d => state.label[d].includes(point.id))[0]

          return (
            <Tooltip key={point.id} title={<pre>{myLabel}</pre>}>
              <circle
                key={point.label}
                className={clsx('marks', {
                  [classes.unionMark]: selectedPoints.includes(point.id),
                  [classes.regularMark]: !selectedPoints.includes(point.id),
                  [classes.hoveredLabel]: hoverLabeledNode !== "" && myLabel !== hoverLabeledNode,
                  [classes.regularForceMark]: hoveredPrediction ? true : false,
                  [classes.matches]: matchIds.includes(point.id),
                  [classes.isnp]: isnpIds.includes(point.id),
                  [classes.ipns]: ipnsIds.includes(point.id),
                  [labelColorList[labelColorIndex]]: true,
                })}
                cx={xScale(point.x as number)}
                cy={yScale(point.y as number)}
                id={`mark${point.id}`}
                opacity="0.5"
                r="5"
                onMouseEnter={() => {
                    setHoverLabeledNode(myLabel);
                }}
                onMouseLeave={() => setHoverLabeledNode('')}
              />
            </Tooltip>
          );
        })}

      {aggPoints.map((point) => {
        return (
          <circle
            key={point.label}
            className={clsx('marks', {
              [classes.regularMark]: true,
            })}
            cx={xScale(point.x as number)}
            cy={yScale(point.y as number)}
            id={`mark${point.id}`}
            opacity="0.5"
            r="8"
          />
        );
      })}
    </>
  );
};

export default observer(LabelMarks);
