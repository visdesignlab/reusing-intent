/* eslint-disable @typescript-eslint/no-unused-vars */
import { observer } from 'mobx-react';
import React, { FC, useCallback, useEffect, useRef, useState } from 'react';

import { getBrushId } from '../../../Utils/IDGens';
import translate from '../../../Utils/Translate';
import { Brush, BrushAffectType, BrushCollection } from '../Types/Brush';

import SingleBrushComponent from './SingleBrushComponent';

export type BrushUpdateFunction = (
  brushes: BrushCollection,
  affectedBrush: Brush,
  affectType: BrushAffectType,
) => void;

type Props = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  brushes: BrushCollection;
  onBrush: (brush: Brush) => void;
  extentPadding?: number;
};

const BrushComponent: FC<Props> = ({
  left,
  right,
  top,
  bottom,
  brushes,
  onBrush,
  extentPadding = 0,
}: Props) => {
  // Dimension Calcs
  const [height, width] = [Math.abs(bottom - top), Math.abs(left - right)];
  const [adjustedHeight, adjustedWidth] = [
    Math.abs(bottom + extentPadding - (top - extentPadding)),
    Math.abs(left - extentPadding - (right + extentPadding)),
  ];

  // Refs
  const overlayRef = useRef<SVGRectElement>(null);

  // State
  const [mouseDownCreation, setMouseDownCreation] = useState(false);
  const [mouseDownResize, setMouseDownResize] = useState(false);
  const [activeBrush, setActiveBrush] = useState<Brush | null>(null);

  // Callbacks

  // Creation Mouse Down
  const handleMouseDownCreation = useCallback(
    (event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
      const currentTarget = event.currentTarget.getBoundingClientRect();
      const brush: Brush = {
        id: getBrushId(),
        extents: {
          x1: (event.clientX - currentTarget.left - extentPadding) / width,
          x2: (event.clientX - currentTarget.left - extentPadding) / width,
          y1: (event.clientY - currentTarget.top - extentPadding) / height,
          y2: (event.clientY - currentTarget.top - extentPadding) / height,
        },
      };

      setMouseDownCreation(true);
      setActiveBrush(brush);
    },
    [extentPadding, height, width],
  );

  // Creation Mouse Move
  const handleMouseMoveCreation = useCallback(
    (event: MouseEvent) => {
      const targetNode = overlayRef.current;

      if (!targetNode || !activeBrush) return;

      const { left, top } = targetNode.getBoundingClientRect();

      const x1 = activeBrush.extents.x1;
      const y1 = activeBrush.extents.y1;

      let x2 = (event.clientX - left - extentPadding) / width;
      let y2 = (event.clientY - top - extentPadding) / height;

      if (x2 * width < 0 - extentPadding || x2 * width > width + extentPadding) {
        x2 = activeBrush.extents.x2;
      }

      if (y2 * height < 0 - extentPadding || y2 * height > height + extentPadding) {
        y2 = activeBrush.extents.y2;
      }

      activeBrush.extents = { x1, x2, y1, y2 };

      setActiveBrush({ ...activeBrush });
    },
    [activeBrush, extentPadding, height, width],
  );

  // Creation Mouse Up
  const handleMouseUpCreation = useCallback(() => {
    if (!activeBrush) return;

    let { x1, x2, y1, y2 } = activeBrush.extents;
    const isNewBrushRedundant = Math.abs(x1 - x2) < 0.00001 || Math.abs(y1 - y2) < 0.00001;

    if (!isNewBrushRedundant) {
      if (x1 > x2) [x1, x2] = [x2, x1];

      if (y1 > y2) [y1, y2] = [y2, y1];

      activeBrush.extents = correctBrushExtents({ x1, x2, y1, y2 });

      onBrush(activeBrush);
    }

    setActiveBrush(null);
    setMouseDownCreation(false);
  }, [activeBrush, onBrush]);

  // Add effects
  useEffect(() => {
    if (!mouseDownCreation) return;
    addEvents();

    return removeEvents;
  });

  // Add/Remove Global Events
  function addEvents() {
    if (mouseDownCreation) {
      window.addEventListener('mousemove', handleMouseMoveCreation);
      window.addEventListener('mouseup', handleMouseUpCreation);
    } else if (mouseDownResize) {
      console.log('Resize');
    }
  }

  function removeEvents() {
    if (mouseDownCreation) {
      window.removeEventListener('mousemove', handleMouseMoveCreation);
      window.removeEventListener('mouseup', handleMouseUpCreation);
    } else if (mouseDownResize) {
      console.log('Resize R');
    }
  }

  // Components
  const overlay = (
    <rect
      ref={overlayRef}
      cursor="crosshair"
      fill="none"
      height={adjustedHeight}
      pointerEvents="all"
      transform={translate(left - extentPadding, top - extentPadding)}
      width={adjustedWidth}
      onMouseDown={handleMouseDownCreation}
    />
  );

  let { x1, x2, y1, y2 } = correctBrushExtents(
    activeBrush?.extents || { x1: 0, x2: 0, y1: 0, y2: 0 },
  );
  [x1, y1, x2, y2] = [x1 * width, y1 * height, x2 * width, y2 * height];

  const renderedBrushes = (
    <g>
      {activeBrush && (
        <SingleBrushComponent
          brushId={activeBrush.id}
          brushes={brushes}
          extentHeight={height}
          extentPadding={extentPadding}
          extentWidth={width}
          height={y2 - y1}
          overlayRef={overlayRef}
          removeBrush={(brushId) => {
            console.log(brushId);
          }}
          width={x2 - x1}
          x={x1}
          y={y1}
          onBrushUpdate={
            (() => {
              console.log('');
            }) as any
          }
          onResizeStart={
            (() => {
              console.log('resize');
            }) as any
          }
        />
      )}

      {Object.values(brushes).map((br) => {
        let { x1, x2, y1, y2 } = br.extents;
        [x1, y1, x2, y2] = [x1 * width, y1 * height, x2 * width, y2 * height];

        return (
          <SingleBrushComponent
            key={br.id}
            brushId={br.id}
            brushes={brushes}
            extentHeight={height}
            extentPadding={extentPadding}
            extentWidth={width}
            height={y2 - y1}
            overlayRef={overlayRef}
            removeBrush={(brushId) => {
              console.log(brushId);
            }}
            width={x2 - x1}
            x={x1}
            y={y1}
            onBrushUpdate={
              (() => {
                console.log('');
              }) as any
            }
            onResizeStart={
              (() => {
                console.log('resize');
              }) as any
            }
          />
        );
      })}
    </g>
  );

  const [first, second] = [renderedBrushes, overlay];

  return (
    <g id="brush-component">
      {first}
      {second}
    </g>
  );
};

export default observer(BrushComponent);

function correctBrushExtents(input: { x1: number; x2: number; y1: number; y2: number }) {
  let { x1, x2, y1, y2 } = input;

  if (x2 < x1) {
    [x1, x2] = [x2, x1];
  }

  if (y2 < y1) {
    [y1, y2] = [y2, y1];
  }

  return { x1, x2, y1, y2 };
}
