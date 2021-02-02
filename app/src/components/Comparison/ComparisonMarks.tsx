import { Tooltip } from '@material-ui/core';
import { ScaleLinear } from 'd3';
import { observer } from 'mobx-react';
import React, { FC } from 'react';

import useScatterplotStyle from '../Scatterplot.tsx/styles';
import { DataDisplay } from '../Scatterplot.tsx/Scatterplot';

type Props = {
  points: { x: number; y: number; label: string; id: string }[];
  compPoints: { x: number; y: number; label: string; id: string }[];
  selectedPoints: string[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  dataDisplay: DataDisplay;
};

const Marks: FC<Props> = ({ points, selectedPoints, xScale, yScale, compPoints, dataDisplay }: Props) => {
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
  }
  else if (dataDisplay === "Diff")
  {
    return (
      <>
        {points
          .filter((point) => {
            return (
              compPoints.filter((i) => i.label === point.label).length === 0 ||
              compPoints.filter(
                (d) => d.label === point.label && (d.x !== point.x || d.y !== point.y),
              ).length > 0
            );
          })
          .map((point) => {
            if (compPoints !== null) {
              //if the compPoint removed the point
              if (compPoints.filter((d) => d.label === point.label).length === 0) {
                return (
                  <g
                    key={point.label}
                    className={`marks ${classes.removedMark}`}
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

              const editGroup = compPoints.filter(
                (d) => d.label === point.label && (d.x !== point.x || d.y !== point.y),
              );

              //if the compPoint removed the point
              if (
                editGroup.length > 0
              ) {
                return (
                  <g>
                    <circle
                      key={point.label}
                      className={`marks ${classes.movedPoint}`}
                      cx={xScale(point.x as number)}
                      cy={yScale(point.y as number)}
                      id={`mark${point.id}`}
                      opacity="0.5"
                      r="5"
                    />
                    <line
                      className={`marks ${classes.movedLine}`}
                      x1={xScale(point.x)}
                      x2={xScale(editGroup[0].x)}
                      y1={yScale(point.y)}
                      y2={yScale(editGroup[0].y)}
                    />
                  </g>
                );
              }
            }

            return (
              <circle
                key={point.label}
                className={`marks ${selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark}`}
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
                className={`marks ${classes.newMark}`}
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
        {points
          .map((point) => {
            if (compPoints !== null) {
              //if the compPoint removed the point
              if (compPoints.filter((d) => d.label === point.label).length === 0) {
                return (
                  <g
                    key={point.label}
                    className={`marks ${classes.removedMark}`}
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
                    <circle
                      key={point.label}
                      className={`marks ${classes.movedPoint}`}
                      cx={xScale(point.x as number)}
                      cy={yScale(point.y as number)}
                      id={`mark${point.id}`}
                      opacity="0.5"
                      r="5"
                    />
                    <line
                      className={`marks ${classes.movedLine}`}
                      x1={xScale(point.x)}
                      x2={xScale(editGroup[0].x)}
                      y1={yScale(point.y)}
                      y2={yScale(editGroup[0].y)}
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
                className={`marks ${classes.newMark}`}
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

export default observer(Marks);
