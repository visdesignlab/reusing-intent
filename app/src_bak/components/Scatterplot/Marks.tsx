import { Tooltip } from '@material-ui/core';
import clsx from 'clsx';
import { ScaleLinear } from 'd3';
import { observer } from 'mobx-react';
import { FC, useContext } from 'react';

import Store from '../../Store/Store';

import useScatterplotStyle from './styles';

type Props = {
  points: { x: number; y: number; label: string; id: string }[];
  selectedPoints: string[];
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
};

const Marks: FC<Props> = ({ points, selectedPoints, xScale, yScale }: Props) => {
  const {
    exploreStore: { hoveredPrediction },
  } = useContext(Store);
  const classes = useScatterplotStyle();
  const { matches: matchIds = [], isnp: isnpIds = [], ipns: ipnsIds = [] } =
    hoveredPrediction?.membership || {};

  return (
    <>
      {points.map((point) => {
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
    </>
  );
};

export default observer(Marks);
