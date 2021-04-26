/* eslint-disable @typescript-eslint/no-unused-vars */
import { Tooltip } from '@material-ui/core';
import { ScaleLinear } from 'd3';
import { observer } from 'mobx-react';
import { FC, useContext } from 'react';

import Store from '../../Store/Store';
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

  const { updatedFilterPoints } = useContext(Store).compareStore;

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
                } `}
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
  } else if (dataDisplay === 'AddedOnly') {
    return (
      <>
        {compPoints
          .filter((d) => {
            return (
              points.filter((i) => i.label === d.label).length === 0 &&
              !updatedFilterPoints.includes(d.id)
            );
          })
          .map((point) => {
            return (
              <g
                key={point.label}
                className={`marks ${classes.newMark} ${
                  selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
                } ${selectedPoints.length === 0 ? classes.newColor : ''}`}
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
  } else if (dataDisplay === 'ChangedOnly') {
    return (
      <>
        {points.map((point) => {
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
                      xScale(point.x as number),
                      xScale(editGroup[0].x as number),
                      yScale(point.y as number),
                      yScale(editGroup[0].y as number),
                    )}
                    style={{ opacity: '0.4' }}
                  />
                  <circle
                    key={point.label}
                    className={`marks ${classes.movedPoint} ${
                      selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
                    }`}
                    cx={xScale(point.x as number)}
                    cy={yScale(point.y as number)}
                    id={`mark${point.id}`}
                    opacity=".2"
                    r="5"
                  />
                  <circle
                    key={editGroup[0].label + '2'}
                    className={`marks ${classes.movedPoint} ${
                      selectedPoints.includes(editGroup[0].id)
                        ? classes.unionMark
                        : classes.regularMark
                    }`}
                    cx={xScale(editGroup[0].x as number)}
                    cy={yScale(editGroup[0].y as number)}
                    id={`mark${point.id}`}
                    opacity="1"
                    r="5"
                  />
                </g>
              );
            }
          }

          return null;
        })}
      </>
    );
  } else if (dataDisplay === 'RemovedOnly') {
    return (
      <>
        {points.map((point) => {
          if (compPoints !== null) {
            //if the compPoint removed the point
            if (compPoints.filter((d) => d.label === point.label).length === 0) {
              return (
                <g
                  key={point.id}
                  className={`marks ${classes.removedMark} ${
                    selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
                  } ${selectedPoints.length === 0 ? classes.removedColor : ''}`}
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

          return <g key={point.id} />;
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
                  } ${selectedPoints.length === 0 ? classes.removedColor : ''}`}
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
                    style={{ opacity: '0.4' }}
                  />
                  <g
                    key={point.label}
                    className={`marks ${classes.movedPoint} ${
                      selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
                    }`}
                    id={`mark${point.id}`}
                    opacity="0.5"
                    transform={`translate(${xScale(point.x as number) - 5}, ${
                      yScale(point.y as number) - 5
                    })`}
                  >
                    <polygon points="0 5, 5 10, 10 5, 5 0" />
                  </g>
                  <g
                    key={editGroup[0].label + '2'}
                    className={`marks ${classes.movedPoint} ${
                      selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
                    }`}
                    id={`mark${editGroup[0].id}`}
                    opacity="0.5"
                    transform={`translate(${xScale(editGroup[0].x as number) - 5}, ${
                      yScale(editGroup[0].y as number) - 5
                    })`}
                  >
                    <polygon points="0 5, 5 10, 10 5, 5 0" />
                  </g>
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
            return (
              points.filter((i) => i.label === d.label).length === 0 &&
              !updatedFilterPoints.includes(d.id)
            );
          })
          .map((point) => {
            return (
              <g
                key={point.label}
                className={`marks ${classes.newMark} ${
                  selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
                } ${selectedPoints.length === 0 ? classes.newColor : ''}`}
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
              <Tooltip key={point.label} title={<pre>{JSON.stringify(point, null, 2)}</pre>}>
                <g
                  key={point.label}
                  className={`marks ${classes.removedMark} ${
                    selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
                  } ${selectedPoints.length === 0 ? classes.removedColor : ''}`}
                  id={`mark${point.id}`}
                  opacity="0.5"
                  transform={`translate(${xScale(point.x as number) - 3}, ${
                    yScale(point.y as number) - 3
                  })`}
                >
                  <line x2="6" y2="6" />
                  <line x1="6" y2="6" />
                </g>
              </Tooltip>
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
              <Tooltip key={point.label} title={<pre>{JSON.stringify(point, null, 2)}</pre>}>
                <g>
                  <path
                    className={`marks ${classes.movedLine} ${
                      selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
                    }`}
                    d={createComet(
                      xScale(point.x as number),
                      xScale(editGroup[0].x as number),
                      yScale(point.y as number),
                      yScale(editGroup[0].y as number),
                    )}
                    style={{ opacity: '0.4' }}
                  />
                  <circle
                    key={point.label}
                    className={`marks ${classes.movedPoint} ${
                      selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
                    }`}
                    cx={xScale(point.x as number)}
                    cy={yScale(point.y as number)}
                    id={`mark${point.id}`}
                    opacity=".2"
                    r="5"
                  />
                  <circle
                    key={editGroup[0].label + '2'}
                    className={`marks ${classes.movedPoint} ${
                      selectedPoints.includes(editGroup[0].id)
                        ? classes.unionMark
                        : classes.regularMark
                    }`}
                    cx={xScale(editGroup[0].x as number)}
                    cy={yScale(editGroup[0].y as number)}
                    id={`mark${point.id}`}
                    opacity="1"
                    r="5"
                  />
                </g>
              </Tooltip>
            );
          }
        }

        return (
          <Tooltip key={point.label} title={<pre>{JSON.stringify(point, null, 2)}</pre>}>
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

      {compPoints
        .filter((d) => {
          return (
            points.filter((i) => i.label === d.label).length === 0 &&
            !updatedFilterPoints.includes(d.id)
          );
        })
        .map((point) => {
          return (
            <Tooltip key={point.label} title={<pre>{JSON.stringify(point, null, 2)}</pre>}>
              <g
                key={point.label}
                className={`marks ${classes.newMark} ${
                  selectedPoints.includes(point.id) ? classes.unionMark : classes.regularMark
                } ${selectedPoints.length === 0 ? classes.newColor : ''}`}
                id={`mark${point.id}`}
                opacity="0.5"
                transform={`translate(${xScale(point.x as number) - 5}, ${
                  yScale(point.y as number) - 5
                })`}
              >
                <polygon points="0 0, 5 10, 10 0" />
              </g>
            </Tooltip>
          );
        })}
    </>
  );
};

export function createComet(x1: number, x2: number, y1: number, y2: number): string {
  const theta = Math.atan((x1 - x2) / (y1 - y2));

  const xLength = 4.5 * Math.cos(theta);
  const yLength = 4.5 * Math.sin(theta);

  return `M ${x2 + xLength} ${y2 - yLength} 
  L ${x1} ${y1} 
  L ${x2 - xLength} ${y2 + yLength}
  z`;
}

export default observer(Marks);
