import React, { FC } from 'react';

type Props = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  brushes: Brushes;
  update: (affectedBrush: Brush, operation: BrushOperation) => void;
};

const MultiBrush: FC<Props> = ({ left, right, top, bottom }: Props) => {
  const [height, width] = [Math.abs(bottom - top), Math.abs(left - right)];

  const debugOverlay = <rect fill="blue" height={height} opacity="0.05" width={width} />;

  return <g>{debugOverlay}</g>;
};

export default MultiBrush;

export type BrushResizeDirection =
  | 'LEFT'
  | 'RIGHT'
  | 'TOP'
  | 'BOTTOM'
  | 'TOPLEFT'
  | 'TOPRIGHT'
  | 'BOTTOMLEFT'
  | 'BOTTOMRIGHT';

export type Brush = {
  id: string;
  extents: {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
  };
};

export type Brushes = { [key: string]: Brush };

export type BrushOperation = 'ADD' | 'REMOVE' | 'CHANGE' | 'CLEAR';
