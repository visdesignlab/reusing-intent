import { makeStyles } from '@material-ui/core';
import { select } from 'd3';
import { observer } from 'mobx-react';
import React, { FC, useEffect, useRef, useState } from 'react';

import translate from '../../Utils/Translate';

export type BrushSize = '20';

const useStyles = makeStyles(() => ({
  brushStyle: {
    cursor: 'grabbing',
  },
}));

export const union_color = 'rgb(244, 106, 15)';

type MousePosition = {
  x: number;
  y: number;
};

type BrushStartHandler = (x: number, y: number, radius: number) => void;
type BrushMoveHandler = (x: number, y: number, radius: number) => void;
type BrushEndHandler = (mousePos?: MousePosition) => void;

type Props = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  extentPadding?: number;
  onBrushStart?: BrushStartHandler;
  onBrush?: BrushMoveHandler;
  onBrushEnd?: BrushEndHandler;
};

const FreeFormBrush: FC<Props> = ({
  left = 0,
  right = 0,
  top = 0,
  bottom = 0,
  extentPadding = 0,
  onBrushStart,
  onBrush,
  onBrushEnd,
}: Props) => {
  const { brushStyle } = useStyles();
  const brushRef = useRef<SVGCircleElement>(null);
  const layerRef = useRef<SVGRectElement>(null);

  const brushSize: BrushSize = '20';

  const radius = parseInt(brushSize) || 20;

  const [mouseIn, setMouseIn] = useState(false);
  const [mouseDown, setMouseDown] = useState(false);

  const [height, width] = [
    Math.abs(bottom + extentPadding - (top - extentPadding)),
    Math.abs(left - extentPadding - (right + extentPadding)),
  ];

  function handleMouseDown(event: React.MouseEvent<SVGElement, MouseEvent>) {
    const targetNode = layerRef.current;

    if (targetNode) {
      const target = targetNode.getBoundingClientRect();
      const [x, y] = [event.clientX - target.left, event.clientY - target.top];

      if (onBrushStart) {
        onBrushStart(x, y, radius);
      }
    }
    setMouseDown(true);
  }

  function handleMouseUp(event: MouseEvent) {
    const targetNode = layerRef.current;

    if (targetNode) {
      const target = targetNode.getBoundingClientRect();
      const [x, y] = [event.clientX - target.left, event.clientY - target.top];

      if (onBrushEnd) {
        onBrushEnd({ x, y });
      }
    }
    setMouseDown(false);
  }

  function handleMove(event: MouseEvent) {
    if (!mouseIn) return;
    const node = brushRef.current;
    const targetNode = layerRef.current;

    if (node && targetNode) {
      const target = targetNode.getBoundingClientRect();
      const [x, y] = [event.clientX - target.left, event.clientY - target.top];

      const nodeSelection = select(node);

      const edgeX = x + radius >= width + 10 || x - radius <= -10;
      const edgeY = y + radius >= height + 10 || y - radius <= -10;

      if (!edgeX) nodeSelection.attr('cx', x);

      if (!edgeY) nodeSelection.attr('cy', y);

      if (onBrush && mouseDown) {
        onBrush(x, y, radius);
      }
    }
  }

  function addEvent() {
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleMouseUp);
  }

  function removeEvent() {
    window.removeEventListener('mousemove', handleMove);
    window.removeEventListener('mouseup', handleMouseUp);
  }

  useEffect(() => {
    addEvent();

    return removeEvent;
  });

  const strokeColor = mouseDown ? union_color : 'gray';

  return (
    <g
      transform={translate(-extentPadding, -extentPadding)}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setMouseIn(true)}
      onMouseLeave={() => {
        if (!mouseDown) setMouseIn(false);
      }}
    >
      <rect ref={layerRef} fill="none" height={height} pointerEvents="all" width={width} />
      <circle
        ref={brushRef}
        className={brushStyle}
        fill="none"
        pointerEvents={mouseDown ? 'all' : 'initial'}
        r={radius}
        stroke={strokeColor}
        strokeWidth="2"
      />
    </g>
  );
};

export default observer(FreeFormBrush);
