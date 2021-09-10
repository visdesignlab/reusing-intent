/* eslint-disable @typescript-eslint/no-explicit-any */
import { scaleLinear, ScaleLinear, scalePoint } from 'd3';
import { useMemo } from 'react';

import { DataPoint } from '../../stores/types/Dataset';

export function usePCP(
  data: DataPoint[],
  dimensions: string[],
  height: number,
  width: number,
  groupWidth: number,
  rangeMap: any,
) {
  const attributeSpreadScale = useMemo(() => {
    const scale = scalePoint(dimensions, [0 + groupWidth / 2, width - groupWidth / 2]);

    return scale;
  }, [dimensions, width, groupWidth]);

  const attributeScales = useMemo(() => {
    const scales: { [attr: string]: ScaleLinear<number, number> } = {};

    dimensions.forEach((dim) => {
      if (!rangeMap[dim]) scales[dim] = scaleLinear();
      else {
        const { min, max } = rangeMap[dim];
        const scale = scaleLinear().domain([min, max]).range([0, height]).clamp(true).nice();
        scales[dim] = scale;
      }
    });

    return scales;
  }, [dimensions, rangeMap, height]);

  return { data, dimensions, attributeSpreadScale, attributeScales };
}
