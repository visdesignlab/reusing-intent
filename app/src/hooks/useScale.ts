import { scaleLinear, ScaleLinear } from 'd3';
import { useMemo } from 'react';

export default function useScale(
  domain: [number, number],
  range: [number, number],
  nice = true,
): ScaleLinear<number, number> {
  const scale = useMemo(() => {
    const scale = scaleLinear().domain(domain).range(range).clamp(true);

    if (nice) scale.nice();

    return scale;
  }, [domain, range, nice]);

  return scale;
}
