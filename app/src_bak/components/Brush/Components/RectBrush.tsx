import { createStyles, makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import { FC, useEffect, useState } from 'react';

import translate from '../../../Utils/Translate';

import { ResizeDirection } from './BrushComponent';

type Props = {
  id: string;
  x: number;
  y: number;
  height: number;
  width: number;
  onMouseDown: (event: React.MouseEvent<SVGRectElement, MouseEvent>, id: string) => void;
  onResizeStart: (brushId: string, direction: ResizeDirection) => void;
  closeHandler: (id: string) => void;
  resizeHandlerSize?: number;
};

const useStyles = makeStyles(() =>
  createStyles({
    base: {
      fill: 'green',
      opacity: 0.1,
      stroke: 'black',
      strokeWidth: 2,
      cursor: 'move',
      '&:hover': {
        strokeWidth: 5,
      },
    },
    closeIconText: {
      fontWeight: 'bolder',
      fontFamily: 'FontAwesome',
      fontSize: '1.5rem',
      fill: 'red',
    },
    closeIconBackground: {
      cursor: 'pointer',
      fill: '#777',
      opacity: '0.1',
    },
    resizeBase: {
      pointerEvents: 'all',
      fill: 'none',
      stroke: 'none',
    },
    ns: {
      cursor: 'ns-resize',
    },
    ew: {
      cursor: 'ew-resize',
    },
    nwse: {
      cursor: 'nwse-resize',
    },
    nesw: {
      cursor: 'nesw-resize',
    },
  }),
);

const RectBrush: FC<Props> = ({
  id,
  x,
  y,
  height,
  width,
  onMouseDown,
  onResizeStart,
  closeHandler,
  resizeHandlerSize = 10,
}: Props) => {
  const [showIcon, setShowIcon] = useState(false);
  const [timeoutId, setTimeoutId] = useState(-1);

  const { base, resizeBase, ns, ew, nwse, nesw, closeIconText, closeIconBackground } = useStyles();

  useEffect(() => {
    return () => clearInterval(timeoutId);
  });

  const baseRectangle = (
    <rect
      className={base}
      height={height}
      width={width}
      onMouseDown={(event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
        onMouseDown(event, id);
      }}
      onMouseEnter={() => {
        clearInterval(timeoutId);
        setShowIcon(true);
      }}
      onMouseLeave={() => {
        const tout = setTimeout(() => {
          setShowIcon(false);
        }, 900);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setTimeoutId(tout as any);
      }}
    />
  );

  const northRect = (
    <rect
      className={clsx(resizeBase, ns)}
      height={resizeHandlerSize}
      width={width - resizeHandlerSize}
      x={resizeHandlerSize / 2}
      y={-resizeHandlerSize / 2}
      onMouseDown={() => onResizeStart(id, 'N')}
    />
  );

  const southRect = (
    <rect
      className={clsx(resizeBase, ns)}
      height={resizeHandlerSize}
      width={width - resizeHandlerSize}
      x={resizeHandlerSize / 2}
      y={height - resizeHandlerSize / 2}
      onMouseDown={() => onResizeStart(id, 'S')}
    />
  );

  const westRect = (
    <rect
      className={clsx(resizeBase, ew)}
      height={height - resizeHandlerSize}
      width={resizeHandlerSize}
      x={-resizeHandlerSize / 2}
      y={resizeHandlerSize / 2}
      onMouseDown={() => onResizeStart(id, 'W')}
    />
  );

  const eastRect = (
    <rect
      className={clsx(resizeBase, ew)}
      height={height - resizeHandlerSize}
      width={resizeHandlerSize}
      x={width - resizeHandlerSize / 2}
      y={resizeHandlerSize / 2}
      onMouseDown={() => onResizeStart(id, 'E')}
    />
  );

  const nwRect = (
    <rect
      className={clsx(resizeBase, nwse)}
      height={resizeHandlerSize}
      width={resizeHandlerSize}
      x={-resizeHandlerSize / 2}
      y={-resizeHandlerSize / 2}
      onMouseDown={() => onResizeStart(id, 'NW')}
    />
  );
  const neRect = (
    <rect
      className={clsx(resizeBase, nesw)}
      height={resizeHandlerSize}
      width={resizeHandlerSize}
      x={width - resizeHandlerSize / 2}
      y={-resizeHandlerSize / 2}
      onMouseDown={() => onResizeStart(id, 'NE')}
    />
  );

  const swRect = (
    <rect
      className={clsx(resizeBase, nesw)}
      height={resizeHandlerSize}
      width={resizeHandlerSize}
      x={-resizeHandlerSize / 2}
      y={height - resizeHandlerSize / 2}
      onMouseDown={() => onResizeStart(id, 'SW')}
    />
  );
  const seRect = (
    <rect
      className={clsx(resizeBase, nwse)}
      height={resizeHandlerSize}
      width={resizeHandlerSize}
      x={width - resizeHandlerSize / 2}
      y={height - resizeHandlerSize / 2}
      onMouseDown={() => onResizeStart(id, 'SE')}
    />
  );

  return (
    <g transform={translate(x, y)}>
      {baseRectangle}
      {northRect}
      {southRect}
      {westRect}
      {eastRect}
      {nwRect}
      {neRect}
      {swRect}
      {seRect}
      <g display={showIcon ? 'visible' : 'none'} transform={translate(width, -10)}>
        <text className={closeIconText} dominantBaseline="middle" dy="1" textAnchor="middle">
          &#xf05e;
        </text>
        <circle
          className={closeIconBackground}
          fill="none"
          r="10"
          stroke="black"
          onClick={() => closeHandler(id)}
        />
      </g>
    </g>
  );
};

export default RectBrush;
