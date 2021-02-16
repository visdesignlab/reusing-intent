import { Tooltip } from '@material-ui/core';
import { ScaleLinear } from 'd3';
import { observer } from 'mobx-react';
import React, { FC } from 'react';

import useScatterplotStyle from '../Scatterplot/styles';

import { DataDisplay } from './ComparisonScatterplot';

type Props = {
  points: { x: number; y: number; label: string; id: string }[];
  compPoints: { x: number; y: number; label: string; id: string }[];
  selectedPoints: string[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  dataDisplay: DataDisplay;
};

const Marks: FC<Props> = ({
  points,
  selectedPoints,
  xScale,
  yScale,
  compPoints,
  dataDisplay,
}: Props) => {
  const classes = useScatterplotStyle();

  if (!compPoints || dataDisplay === 'Original') {
    return (
      <>
        {points.map((point) => {
          return (
            <Tooltip key={point.id} title={<pre>{JSON.stringify(point, null, 2)}</pre>}>
              <circle
                key={point.label}
                className={`marks ${
                  selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
                }`}
                cx={xScale(point.x as number)}
                cy={yScale(point.y as number)}
                id={`mark${point.id}`}
                opacity="0.5"
                r="5"
              />
            </Tooltip>
          );
        })}
      </>
    );
  } else if (dataDisplay === 'Comparison') {
    return (
      <>
        {compPoints.map((point) => {
          return (
            <circle
              key={point.label}
              className={`marks ${
                selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
              }`}
              cx={xScale(point.x as number)}
              cy={yScale(point.y as number)}
              id={`mark${point.id}`}
              opacity="0.5"
              r="5"
            />
          );
        })}
      </>
    );
    } else if (dataDisplay === 'Diff') {
        return (
            <>
              {points.map((point) => {
                if (compPoints !== null) {
                  //if the compPoint removed the point
                  if (compPoints.filter((d) => d.label === point.label).length === 0) {
                    return (
                      <g
                        key={point.label}
                        className={`marks ${classes.removedMark} ${
                          selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
                        }`}
                        id={`mark${point.id}`}
                        opacity="0.5"
                        transform={`translate(${xScale(point.x as number) - 3}, ${
                          yScale(point.y as number) - 3
                        })`}
                      >
                        <line x2="6" y2="6" />
                        <line x1="6" y2="6" />
                      </g>
                    );
                  }
                }

                if (compPoints !== null) {
                  //if the compPoint removed the point
                  const editGroup = compPoints.filter(
                    (d) => d.label === point.label && (d.x !== point.x || d.y !== point.y),
                  );

                  if (editGroup.length > 0) {
                    return (
                      <g>
                        <path
                          className={`marks ${classes.movedLine} ${
                            selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
                          }`}
                          d={createComet(
                            xScale(point.x),
                            xScale(editGroup[0].x),
                            yScale(point.y),
                            yScale(editGroup[0].y),
                          )}
                          style={{opacity: "0.4"}}
                        />
                        <circle
                          key={point.label}
                          className={`marks ${classes.movedPoint} ${
                            selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
                          }`}
                          cx={xScale(point.x as number)}
                          cy={yScale(point.y as number)}
                          id={`mark${point.id}`}
                          opacity="0.5"
                          r="5"
                        />
                        <circle
                          key={editGroup[0].label}
                          className={`marks ${classes.movedPoint} ${
                            selectedPoints.includes(editGroup[0].id)
                              ? classes.unionMark
                              : classes.regularMark
                          }`}
                          cx={xScale(editGroup[0].x as number)}
                          cy={yScale(editGroup[0].y as number)}
                          id={`mark${point.id}`}
                          opacity="0.2"
                          r="5"
                        />
                      </g>
                    );
                  }
                }

                return (
                  <circle
                    key={point.label}
                    className={`marks ${
                      selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
                    }`}
                    cx={xScale(point.x as number)}
                    cy={yScale(point.y as number)}
                    id={`mark${point.id}`}
                    opacity="0.1"
                    r="5"
                  />
                );
              })}

              {compPoints
                .filter((d) => {
                  return points.filter((i) => i.label === d.label).length === 0;
                })
                .map((point) => {
                  return (
                    <g
                      key={point.label}
                      className={`marks ${classes.newMark} ${
                        selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
                      }`}
                      id={`mark${point.id}`}
                      opacity="0.5"
                      transform={`translate(${xScale(point.x as number) - 5}, ${
                        yScale(point.y as number) - 5
                      })`}
                    >
                      <polygon points="0 0, 5 10, 10 0" />
                    </g>
                  );
                })}
            </>
          );
  }

  return (
    <>
      {points.map((point) => {
        if (compPoints !== null) {
          //if the compPoint removed the point
          if (compPoints.filter((d) => d.label === point.label).length === 0) {
            return (
              <g
                key={point.label}
                className={`marks ${classes.removedMark} ${
                  selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
                }`}
                id={`mark${point.id}`}
                opacity="0.5"
                transform={`translate(${xScale(point.x as number) - 3}, ${
                  yScale(point.y as number) - 3
                })`}
              >
                <line x2="6" y2="6" />
                <line x1="6" y2="6" />
              </g>
            );
          }
        }

        if (compPoints !== null) {
          //if the compPoint removed the point
          const editGroup = compPoints.filter(
            (d) => d.label === point.label && (d.x !== point.x || d.y !== point.y),
          );

          if (editGroup.length > 0) {
            return (
              <g>
                <path
                  className={`marks ${classes.movedLine} ${
                    selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
                  }`}
                  d={createComet(
                    xScale(point.x),
                    xScale(editGroup[0].x),
                    yScale(point.y),
                    yScale(editGroup[0].y),
                  )}
                  style={{opacity: "0.4"}}
                />
                <circle
                  key={point.label}
                  className={`marks ${classes.movedPoint} ${
                    selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
                  }`}
                  cx={xScale(point.x as number)}
                  cy={yScale(point.y as number)}
                  id={`mark${point.id}`}
                  opacity="0.5"
                  r="5"
                />
                <circle
                  key={editGroup[0].label}
                  className={`marks ${classes.movedPoint} ${
                    selectedPoints.includes(editGroup[0].id)
                      ? classes.unionMark
                      : classes.regularMark
                  }`}
                  cx={xScale(editGroup[0].x as number)}
                  cy={yScale(editGroup[0].y as number)}
                  id={`mark${point.id}`}
                  opacity="0.2"
                  r="5"
                />
              </g>
            );
          }
        }

        return (
          <circle
            key={point.label}
            className={`marks ${
              selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
            }`}
            cx={xScale(point.x as number)}
            cy={yScale(point.y as number)}
            id={`mark${point.id}`}
            opacity="0.5"
            r="5"
          />
        );
      })}

      {compPoints
        .filter((d) => {
          return points.filter((i) => i.label === d.label).length === 0;
        })
        .map((point) => {
          return (
            <g
              key={point.label}
              className={`marks ${classes.newMark} ${
                selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
              }`}
              id={`mark${point.id}`}
              opacity="0.5"
              transform={`translate(${xScale(point.x as number) - 5}, ${
                yScale(point.y as number) - 5
              })`}
            >
              <polygon points="0 0, 5 10, 10 0" />
            </g>
          );
        })}
    </>
  );
};

function createComet(x1: number, x2: number, y1: number, y2: number): string{


  return `M ${Math.trunc(x1 + 4)} ${Math.trunc(y1)} 
  L ${Math.trunc(x2) - 1} ${Math.trunc(y2)} 
  L ${Math.trunc(x1 - 4)} ${Math.trunc(y1)}
  z`;
}

export default observer(Marks);
