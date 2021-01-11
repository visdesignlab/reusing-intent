import { extent } from 'd3';
import { useContext, useMemo } from 'react';

import { DatasetColumn } from '../../Store/Dataset';
import Store from '../../Store/Store';

export function useScatterplotData(
  x: DatasetColumn,
  y: DatasetColumn,
  label: DatasetColumn,
): {
  points: { x: number; y: number; label: string; id: number }[];
  x_extents: [number, number];
  y_extents: [number, number];
} {
  const { dataset: data } = useContext(Store).exploreStore;
  const dt =
    useMemo(() => {
      const points =
        data?.values.map((d, id) => ({
          id,
          x: d[x] as number,
          y: d[y] as number,
          label: d[label] as string,
        })) || [];
      const x_extents = extent(points.map((d) => d.x) as number[]) as [number, number];
      const y_extents = extent(points.map((d) => d.y) as number[]) as [number, number];

      return { points, x_extents, y_extents };
    }, [data, x, y, label]) || [];

  return dt;
}
