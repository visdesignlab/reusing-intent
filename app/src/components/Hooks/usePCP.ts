import { extent } from 'd3';
import { useContext, useMemo } from 'react';

import Store from '../../Store/Store';
import { DataPoint } from '../../Store/Types/Dataset';

export function usePCPData(): {
  lines: DataPoint[]
  all_extents: [number, number][];
  allLabels: string[]
} {
  const { loadedDataset: fullData, workingValues: data } = useContext(Store).exploreStore;

  const dt = useMemo(() => {

    const lines: DataPoint[] = data.map((d) => d) || [];

    const all_extents: [number, number][] = []
    const allLabels: string[] = [];

    
    fullData.numericColumns.forEach(a => {
        all_extents.push(extent(data.map((d) => d[a]) as number[]) as [number, number]);
        allLabels.push(a)
    })
    
    return { lines, all_extents, allLabels };
  }, [data, fullData.numericColumns]);

  return dt;
}
