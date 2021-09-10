import { line, ScaleLinear } from 'd3';
import { observer } from 'mobx-react';

import { useStore } from '../../stores/RootStore';

import SkylineOverlay from './SkylineOverlay';

type Props = {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Overlay = ({ xScale, yScale }: Props) => {
  const {
    exploreStore: { hoveredPrediction, dataPoints },
  } = useStore();

  const lineGen = line()
    .x((d) => xScale(d[0]))
    .y((d) => yScale(d[1]));

  if (hoveredPrediction) {
    switch (hoveredPrediction.intent) {
      case 'Cluster': {
        const { hull = [] } = hoveredPrediction.info;

        if (hull.length > 0) {
          return (
            <g>
              <path d={`${lineGen(hull)} Z` || ''} fill="gray" opacity="0.4" stroke="black" />
            </g>
          );
        }

        break;
      }
      case 'Multivariate Optimization': {
        const { edges = [] } = hoveredPrediction.info;
        const { dimensions } = hoveredPrediction;
        const { sense } = hoveredPrediction.params;

        const points = dataPoints
          .filter((d) => edges.includes(d.id))
          .map((d) => [d[dimensions[0]], d[dimensions[1]]]);

        const info = {
          sense,
          frontier: points,
        };

        return <SkylineOverlay info={info} xScale={xScale} yScale={yScale} />;
      }
      default:
        break;
    }
  }

  return <></>;
};

export default observer(Overlay);
