import { scaleLinear, ScaleLinear } from 'd3';
import { useMemo } from 'react';

export function useScale(
  domain: [number, number],
  range: [number, number],
  nice = true,
): ScaleLinear<number, number> {
  const [d0, d1] = domain;
  const [r0, r1] = range;

  const scale = useMemo(() => {
    const scale = scaleLinear().domain([d0, d1]).range([r0, r1]).clamp(true);

    if (nice) scale.nice();

    return scale;
  }, [d0, d1, r0, r1, nice]);

  return scale;
}

export function usePCPScales(
  allLabels: string[],
  allDomain: [number, number][],
  range: [number, number],
): { [key:string] : ScaleLinear<number, number> }{
    
  const scales = useMemo(() => {

    const allScales: { [key: string]: ScaleLinear<number, number> } = {};

    allLabels.forEach((d, i) => {
      const [d0, d1] = allDomain[i];
      const [r0, r1] = range;
      allScales[d] = scaleLinear().domain([d0, d1]).range([r0, r1]).clamp(true).nice();
      
    })

    return allScales;
  }, [allLabels, allDomain, range]);

  return scales;
}
