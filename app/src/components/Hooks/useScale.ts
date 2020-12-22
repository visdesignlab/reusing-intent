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
    const scale = scaleLinear().domain([d0, d1]).range([r0, r1]);

    if (nice) scale.nice();

    return scale;
  }, [d0, d1, r0, r1, nice]);

  return scale;
}
