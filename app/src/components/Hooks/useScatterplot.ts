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
  const { compDataset: compDataFull, loadedDataset: fullData, workingValues: data } = useContext(
    Store,
  ).exploreStore;
  const { compDatasetValues: compData } = useContext(Store).projectStore;

  const dt = useMemo(() => {
    let points;
    let allPoints;

    if (comparisonData) {
      points =
        compData.map((d) => ({
          id: d['id'] as string,
          x: d[x] as number,
          y: d[y] as number,
          label: d[label] as string,
        })) || [];
      allPoints =
        compDataFull?.values.map((d) => ({
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

      allPoints =
        fullData.values.map((d) => ({
          id: d['id'] as string,
          x: d[x] as number,
          y: d[y] as number,
          label: d[label] as string,
        })) || [];
    }

    const x_extents = extent(allPoints.map((d) => d.x) as number[]) as [number, number];
    const y_extents = extent(allPoints.map((d) => d.y) as number[]) as [number, number];

    return { points, x_extents, y_extents };
  }, [compData, comparisonData, x, y, label, data, fullData, compDataFull]);

  return dt;
}
