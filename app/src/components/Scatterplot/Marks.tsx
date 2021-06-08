import { Tooltip } from '@material-ui/core';
import clsx from 'clsx';
import { ScaleLinear } from 'd3';
import { Animate } from 'react-move';
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

const Marks: FC<Props> = ({ points, selectedPoints, xScale, yScale }: Props) => {
  const [aggHover, setAggHover] = useState("");
  
  const {
    exploreStore: { hoveredPrediction, state },
  } = useContext(Store);

  const agg = state.aggregate;
  const lab = state.label;

  const labelNodes: {[key:string]: string} = {};
  let aggregatedNodes: string[] = []
  let aggHoverNodes: string[] = []

  const aggPoints: { x: number; y: number; label: string; id: string }[] = [];


  //finding what nodes are aggregated, and where the actual aggregated node should be located. 
  //currently putting aggregated node at just the mean of all points, both x and y. 
  for(const j in agg)
  {
    if(j === aggHover)
    {
      aggHoverNodes = agg[j].concat(aggHoverNodes);
    }
    
    aggregatedNodes = agg[j].concat(aggregatedNodes);

    const xVals: number[] = []
    const yVals: number[] = []
    agg[j].forEach(d => xVals.push(points.filter(p => p.id === d)[0].x))
    agg[j].forEach(d => yVals.push(points.filter(p => p.id === d)[0].y))

    aggPoints.push({
      x: xVals.reduce((a, b) => a + b, 0) / xVals.length,
      y: yVals.reduce((a, b) => a + b, 0) / yVals.length,
      label: j,
      id: j,
    });
  }

  for (const [key, value] of Object.entries(lab)) {
    for(const j of value)
    {
      labelNodes[j] = key;
    }
  }

  const classes = useScatterplotStyle();
  const { matches: matchIds = [], isnp: isnpIds = [], ipns: ipnsIds = [] } =
    hoveredPrediction?.membership || {};

  const labelColorList = [classes.firstLabel, classes.secondLabel, classes.thirdLabel, classes.fourthLabel, classes.fifthLabel]

  return (
    <>
      {points
        .filter((d) => !aggregatedNodes.includes(d.id))
        .map((point) => {

          const labelColorIndex = Object.keys(lab).indexOf(labelNodes[point.id])

          return (
            <Tooltip key={point.id} title={<pre>{JSON.stringify(point, null, 2)}</pre>}>
              <circle
                key={point.label}
                className={clsx('marks', {
                  [classes.unionMark]: selectedPoints.includes(point.id),
                  [classes.regularMark]: !selectedPoints.includes(point.id),
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
              />
            </Tooltip>
          );
        })}

      {points
        .filter((d) => aggHoverNodes.includes(d.id))
        .map((point) => {
          const aggPoint = aggPoints.filter(d => d.id === aggHover)[0];

          return (
            <Animate
              key={point.id}
              enter={{ x: [point.x], y: [point.y], timing: { duration: 500 } }}
              start={{ x: [aggPoint.x], y: [aggPoint.y], timing: { duration: 500 } }}
              update={{ x: [aggPoint.x], y: [aggPoint.y], timing: { duration: 500 } }}
            >
              {(s) => (
                <circle
                  key={point.label}
                  className={clsx('marks', {
                    [classes.hoveredAgg]: true,
                  })}
                  cx={xScale(s.x as number)}
                  cy={yScale(s.y as number)}
                  fill="red"
                  id={`mark${point.id}`}
                  r="5"
                />
              )}
            </Animate>
          );
        })}

      {aggPoints.map((point) => {
        return (
          <circle
            key={point.label}
            className={clsx('marks', {
              [classes.hoveredAgg]: aggHover === point.id,
              [classes.regularMark]: true,
            })}
            cx={xScale(point.x as number)}
            cy={yScale(point.y as number)}
            id={`mark${point.id}`}
            opacity="0.5"
            r="8"
            onMouseEnter={() => setAggHover(point.id)}
            onMouseLeave={() => setAggHover('')}
          />
        );
      })}
    </>
  );
};

export default observer(Marks);
