import { extent, scaleLinear } from 'd3';
import React, { FC, useCallback, useMemo, useState } from 'react';

import cars from './cars';
import MultiBrush, { Brush, Brushes, BrushOperation } from './components/Brush/Brush';

const xExtents = extent(cars.map((c) => c['Displacement']));
const yExtents = extent(cars.map((c) => c['Weight_in_lbs']));

const App: FC = () => {
  const [brushes, setBrushes] = useState<Brushes>({});

  const xScale = useMemo(() => {
    const scale = scaleLinear().range([0, 800]).nice();

    if (xExtents[0] !== undefined) scale.domain(xExtents);

    return scale;
  }, []);

  const yScale = useMemo(() => {
    const scale = scaleLinear().range([800, 0]).nice();

    if (yExtents[0] !== undefined) scale.domain(yExtents);

    return scale;
  }, []);

  const brushUpdates = useCallback((affectedBrush: Brush, operation: BrushOperation) => {
    const br = brushes;

    switch (operation) {
      case 'ADD':
      case 'CHANGE':
        br[affectedBrush.id] = affectedBrush;
        console.log(`Brush ${operation}`);
        break;
      case 'REMOVE':
        delete br[affectedBrush.id];
        console.log('Brush Removed');
        break;
    }

    setBrushes(br);
  }, []);

  return (
    <div className="App" style={{ padding: '1em' }}>
      <svg height="850" width="850">
        <rect fill="none" height="850" stroke="black" width="850" />
        <g transform="translate(25,25)">
          {cars.map((car) => (
            <circle
              key={`${car['Name']} ${car['Year']} ${car['Weight_in_lbs']}`}
              cx={xScale(car['Displacement'])}
              cy={yScale(car['Weight_in_lbs'])}
              fill="red"
              opacity="0.7"
              r="5"
              stroke="black"
              strokeWidth="0.5"
            />
          ))}
          <MultiBrush
            bottom={800}
            brushes={brushes}
            left={0}
            right={800}
            top={0}
            update={brushUpdates}
          />
        </g>
      </svg>
    </div>
  );
};

export default App;
