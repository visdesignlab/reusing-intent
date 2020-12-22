import React, { FC, memo, useEffect, useRef, useState } from 'react';

import { getBrushId } from '../../../Utils/IDGens';
import { Brush, BrushAffectType, BrushCollection } from '../Types/Brush';

import SingleBrushComponent, { ResizeDirection } from './SingleBrushComponent';

export type BrushUpdateFunction = (
  brushes: BrushCollection,
  affectedBrush: Brush,
  affectType: BrushAffectType,
  mousePosition?: MousePosition,
) => void;

type Props = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  showBrushBorder?: boolean;
  extentPadding?: number;
  onBrushUpdate: BrushUpdateFunction;
  initialBrushes?: BrushCollection;
  brushes: BrushCollection;
  switchOff?: boolean;
};

type MousePosition = { x: number; y: number };

const BrushComponent: FC<Props> = ({
  left,
  right,
  top,
  bottom,
  onBrushUpdate,
  extentPadding = 0,
  switchOff = false,
  brushes,
}: Props) => {
  console.log(brushes);

  const [height, width] = [Math.abs(bottom - top), Math.abs(left - right)];
  const [adjustedHeight, adjustedWidth] = [
    Math.abs(bottom + extentPadding - (top - extentPadding)),
    Math.abs(left - extentPadding - (right + extentPadding)),
  ];

  // Refs
  const overlayRef = useRef<SVGRectElement>(null);

  // State
  const [mouseDown, setMouseDown] = useState(false);
  const [mouseDownResize, setMouseDownResize] = useState(false);
  const [activeBrushId, setActiveBrushId] = useState<string | null>(null);
  const [activeBrush, setActiveBrush] = useState<Brush | null>();
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);

  // Event Add Effect
  useEffect(() => {
    if (!mouseDown && !mouseDownResize) return;
    addEvents();

    return removeEvents;
  });

  // Handlers
  function handleMouseDown(event: React.MouseEvent<SVGRectElement, MouseEvent>) {
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
    setMouseDown(true);
    setActiveBrush(brush);
    setActiveBrushId(brush.id);
    console.log('Start');
  }

  function handleMouseMove(event: MouseEvent) {
    const targetNode = overlayRef.current;

    if (!targetNode || !activeBrushId || !activeBrush) return;

    const target = targetNode.getBoundingClientRect();
    const { left, top } = target;

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

    setActiveBrush(activeBrush);
    console.log('On');
  }

  function handleMouseUp(event: MouseEvent) {
    const targetNode = overlayRef.current;

    if (!targetNode || !activeBrushId || !activeBrush)
      throw new Error('Something went wrong in create brush mouse up handler');

    const target = targetNode.getBoundingClientRect();
    const { left, top } = target;
    let { x1, x2, y1, y2 } = activeBrush.extents;
    const isNewBrushRedundant = Math.abs(x1 - x2) < 0.00001 || Math.abs(y1 - y2) < 0.00001;

    if (isNewBrushRedundant) {
      setActiveBrush(null);
    } else {
      if (x1 > x2) [x1, x2] = [x2, x1];

      if (y1 > y2) [y1, y2] = [y2, y1];

      activeBrush.extents = { x1, x2, y1, y2 };

      onBrushUpdate(brushes, activeBrush, 'Add', {
        x: event.clientX - left,
        y: event.clientY - top,
      });

      setActiveBrush(activeBrush);
    }

    setMouseDown(false);
    setActiveBrushId(null);
  }

  // Resize Handlers
  function handleMouseDownResize(
    event: React.MouseEvent<SVGRectElement, MouseEvent>,
    brushId: string,
    resizeDirection: ResizeDirection,
  ) {
    setMouseDownResize(true);
    setActiveBrushId(brushId);
    setResizeDirection(resizeDirection);
  }

  function handleMouseMoveResize(event: MouseEvent) {
    const targetNode = overlayRef.current;

    if (!targetNode || !activeBrushId || !activeBrush) return;

    let { x1, x2, y1, y2 } = activeBrush.extents;

    switch (resizeDirection) {
      case 'Top':
        y1 += event.movementY / height;
        break;
      case 'Bottom':
        y2 += event.movementY / height;
        break;
      case 'Left':
        x1 += event.movementX / width;
        break;
      case 'Right':
        x2 += event.movementX / width;
        break;
      case 'Top Left':
        y1 += event.movementY / height;
        x1 += event.movementX / width;
        break;
      case 'Top Right':
        y1 += event.movementY / height;
        x2 += event.movementX / width;
        break;
      case 'Bottom Left':
        y2 += event.movementY / height;
        x1 += event.movementX / width;
        break;
      case 'Bottom Right':
        y2 += event.movementY / height;
        x2 += event.movementX / width;
        break;
    }

    if (x1 * width < 0 - extentPadding || x1 * width > width + extentPadding) {
      x1 = activeBrush.extents.x1;
    }

    if (x2 * width < 0 - extentPadding || x2 * width > width + extentPadding) {
      x2 = activeBrush.extents.x2;
    }

    if (y1 * height < 0 - extentPadding || y1 * height > height + extentPadding) {
      y1 = activeBrush.extents.y1;
    }

    if (y2 * height < 0 - extentPadding || y2 * height > height + extentPadding) {
      y2 = activeBrush.extents.y2;
    }

    activeBrush.extents = { x1, x2, y1, y2 };

    setActiveBrush(activeBrush);
  }

  function handleMouseUpResize() {
    if (!activeBrushId) return;

    onBrushUpdate(brushes, brushes[activeBrushId], 'Change');
    setMouseDownResize(false);
    setActiveBrushId(null);
    setResizeDirection(null);
  }

  // Add/Remove Events
  function addEvents() {
    if (mouseDown) {
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('mousemove', handleMouseMove);
    } else if (mouseDownResize) {
      window.addEventListener('mouseup', handleMouseUpResize);
      window.addEventListener('mousemove', handleMouseMoveResize);
    }
  }

  function removeEvents() {
    if (mouseDown) {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    } else if (mouseDownResize) {
      window.removeEventListener('mouseup', handleMouseUpResize);
      window.removeEventListener('mousemove', handleMouseMoveResize);
    }
  }

  // Components
  const overlay = (
    <rect
      ref={overlayRef}
      cursor={switchOff ? 'crosshair' : 'default'}
      fill="none"
      height={adjustedHeight}
      pointerEvents={switchOff ? 'none' : 'all'}
      transform={`translate(${left - extentPadding}, ${top - extentPadding})`}
      width={adjustedWidth}
      onMouseDown={handleMouseDown}
    />
  );

  const brs = (
    <>
      {activeBrush &&
        [activeBrush].map((br) => {
          let { x1, y1, x2, y2 } = correctBrushExtents(br.extents);
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
              removeBrush={removeBrush}
              width={x2 - x1}
              x={x1}
              y={y1}
              onBrushUpdate={onBrushUpdate}
              onResizeStart={(brushId: string, resizeDirection: ResizeDirection) => {
                handleMouseDownResize({} as any, brushId, resizeDirection);
              }}
            />
          );
        })}
      {Object.values(brushes).map((brush) => {
        let { x1, y1, x2, y2 } = correctBrushExtents(brush.extents);
        [x1, y1, x2, y2] = [x1 * width, y1 * height, x2 * width, y2 * height];

        return (
          <SingleBrushComponent
            key={brush.id}
            brushId={brush.id}
            brushes={brushes}
            extentHeight={height}
            extentPadding={extentPadding}
            extentWidth={width}
            height={y2 - y1}
            overlayRef={overlayRef}
            removeBrush={removeBrush}
            width={x2 - x1}
            x={x1}
            y={y1}
            onBrushUpdate={onBrushUpdate}
            onResizeStart={(brushId: string, resizeDirection: ResizeDirection) => {
              handleMouseDownResize({} as any, brushId, resizeDirection);
            }}
          />
        );
      })}
    </>
  );

  const [first, second] = mouseDown ? [brs, overlay] : [overlay, brs];

  function removeBrush(brushId: string) {
    const br = JSON.parse(JSON.stringify(brushes[brushId]));
    delete brushes[brushId];
    // setBrushes(brushes);
    onBrushUpdate(brushes, br, 'Remove');
  }

  return (
    <g id="brush-component">
      {first}
      {second}
    </g>
  );
};

export default memo(BrushComponent);

export function correctBrushExtents(input: { x1: number; x2: number; y1: number; y2: number }) {
  let { x1, x2, y1, y2 } = input;

  if (x2 < x1) {
    [x1, x2] = [x2, x1];
  }

  if (y2 < y1) {
    [y1, y2] = [y2, y1];
  }

  return { x1, x2, y1, y2 };
}
