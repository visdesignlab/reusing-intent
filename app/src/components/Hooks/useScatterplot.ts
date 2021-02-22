import { extent } from 'd3';
import { useContext, useMemo } from 'react';

import Store from '../../Store/Store';
import { DatasetColumn } from '../../Store/Types/Dataset';

export type ScatterplotPoints = { x: number; y: number; label: string; id: string }[];

export function useScatterplotData(
  x: DatasetColumn,
  y: DatasetColumn,
  label: DatasetColumn,
  comparisonData: boolean,
): {
  points: ScatterplotPoints;
  x_extents: [number, number];
  y_extents: [number, number];
} {
  const { compDataset: compData } = useContext(Store).exploreStore;
  const { loadedDatasetValues: data } = useContext(Store).projectStore;

  console.log("inside the hook", JSON.parse(JSON.stringify(data)))

  const dt =
    useMemo(() => {
      let points;

      if (comparisonData) {
        points =
          compData?.values.map((d) => ({
            id: d['id'] as string,
            x: d[x] as number,
            y: d[y] as number,
            label: d[label] as string,
          })) || [];
      } else {
        points =
          data.map((d) => ({
            id: d['id'] as string,
            x: d[x] as number,
            y: d[y] as number,
            label: d[label] as string,
          })) || [];
      }

      const x_extents = extent(points.map((d) => d.x) as number[]) as [number, number];
      const y_extents = extent(points.map((d) => d.y) as number[]) as [number, number];

      console.log(points)

      return { points, x_extents, y_extents };
    }, [compData, comparisonData, x, y, label, data]);

  return dt;
}
