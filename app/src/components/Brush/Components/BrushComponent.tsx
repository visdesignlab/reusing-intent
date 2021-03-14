import { quadtree, ScaleLinear } from 'd3';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { getBrushId } from '../../../Utils/IDGens';
import { Brush, BrushAffectType, BrushCollection } from '../Types/Brush';

import RectBrush from './RectBrush';

export type BrushSelections = { [key: string]: string[] };

type Extents = {
  x1: number;
  x2: number;
  y1: number;
  y2: number;
};

export type BrushHandler = (
  points: BrushSelections,
  brushes: BrushCollection,
  type: BrushAffectType,
  affectedId: string,
) => void;

export type ResizeDirection = 'N' | 'S' | 'E' | 'W' | 'NW' | 'NE' | 'SW' | 'SE';

type BrushData = { x: number; y: number; id: string; [other: string]: unknown };

type Rectangle = [[number, number], [number, number]];

const X = 0;
const Y = 1;
const TOP_LEFT = 0;
const BOTTOM_RIGHT = 1;

function rectIntersects(rect1: Rectangle, rect2: Rectangle) {
  return (
    rect1[TOP_LEFT][X] <= rect2[BOTTOM_RIGHT][X] &&
    rect2[TOP_LEFT][X] <= rect1[BOTTOM_RIGHT][X] &&
    rect1[TOP_LEFT][Y] <= rect2[BOTTOM_RIGHT][Y] &&
    rect2[TOP_LEFT][Y] <= rect1[BOTTOM_RIGHT][Y]
  );
}

function rectContains(rect: Rectangle, point: [number, number]) {
  return (
    rect[TOP_LEFT][X] <= point[X] &&
    point[X] <= rect[BOTTOM_RIGHT][X] &&
    rect[TOP_LEFT][Y] <= point[Y] &&
    point[Y] <= rect[BOTTOM_RIGHT][Y]
  );
}

function useQuadSearch(
  searchArea: { left: number; top: number; right: number; bottom: number },
  data: BrushData[],
  xScale: ScaleLinear<number, number>,
  yScale: ScaleLinear<number, number>,
) {
  const { left, top, right, bottom } = searchArea;
  const quadTree = useMemo(() => {
    const qt = quadtree<BrushData>()
      .extent([
        [left - 1, top - 1],
        [right + 1, bottom + 1],
      ])
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .addAll(data);

    return qt;
  }, [left, top, right, bottom, data, xScale, yScale]);

  const search = (left: number, top: number, right: number, bottom: number) => {
    const selectedNodes: string[] = [];

    quadTree.visit((node, x1, y1, x2, y2) => {
      const overlaps = rectIntersects(
        [
          [left, top],
          [right, bottom],
        ],
        [
          [x1, y1],
          [x2, y2],
        ],
      );

      if (!overlaps) return true;

      if (!node.length) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let newNode: any = node;
        do {
          const d = newNode.data;
          const cx = xScale(d.x);
          const cy = yScale(d.y);

          if (
            rectContains(
              [
                [left, top],
                [right, bottom],
              ],
              [cx, cy],
            )
          ) {
            selectedNodes.push(d.id);
          }
        } while ((newNode = newNode.next));
      }

      return false;
    });

    return selectedNodes;
  };

  return { search };
}

type Props = {
  left: number;
  bottom: number;
  top: number;
  right: number;
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
  data: BrushData[];
  brushes: BrushCollection;
  onBrushHandler: BrushHandler;
  disableBrush?: boolean;
};

const BrushComponent: FC<Props> = ({
  left,
  right,
  top,
  bottom,
  brushes,
  xScale,
  yScale,
  data,
  onBrushHandler,
  disableBrush = false,
}: Props) => {
  const overlayRef = useRef<SVGRectElement>(null);
  const [mouseDownCreation, setMouseDownCreation] = useState(false);
  const [mouseDownMove, setMouseDownMove] = useState(false);
  const [mouseDownResize, setMouseDownResize] = useState(false);
  const [resizeDirection, setResizeDirection] = useState<ResizeDirection | null>(null);
  const [activeBrush, setActiveBrush] = useState<Brush | null>(null);
  const [diff, setDiff] = useState<{ x: number; y: number } | null>(null);

  const [height, width] = [Math.abs(top - bottom), Math.abs(left - right)];

  const { pixelX, pixelY, extentToData, extentToPixel } = useMemo(() => {
    // const yDomainMax = yScale.domain()[1];
    const yScaleUpdated = yScale.copy().domain(yScale.domain()).range(yScale.range());

    const pixelX = (x: number) => xScale(x);
    const pixelY = (y: number) => yScaleUpdated(y);

    const dataX = (x: number) => xScale.invert(x);
    const dataY = (y: number) => yScaleUpdated.invert(y);

    const extentToData = ({ x1, y1, x2, y2 }: Extents) => ({
      x1: dataX(x1),
      x2: dataX(x2),
      y1: dataY(y1),
      y2: dataY(y2),
    });

    const extentToPixel = ({ x1, x2, y1, y2 }: Extents) => ({
      x1: pixelX(x1),
      x2: pixelX(x2),
      y1: pixelY(y1),
      y2: pixelY(y2),
    });

    return { dataX, dataY, pixelX, pixelY, extentToPixel, extentToData };
  }, [xScale, yScale]);

  const { search } = useQuadSearch({ left, top, right, bottom }, data, xScale, yScale);

  const onBrush = useCallback(
    (brushes: BrushCollection, type: BrushAffectType, affectedId: string) => {
      if (disableBrush) return;
      const selections: BrushSelections = {};

      Object.values(brushes).forEach((br) => {
        const { x1, x2, y1, y2 } = br.extents;
        const selected = search(pixelX(x1), pixelY(y2), pixelX(x2), pixelY(y1));
        selections[br.id] = selected;
      });

      onBrushHandler(selections, brushes, type, affectedId);
    },
    [onBrushHandler, search, disableBrush, pixelX, pixelY],
  );

  // ##################################################################### //
  // ############################## Removal ############################## //
  // ##################################################################### //

  const closeBrushHandler = useCallback(
    (id: string) => {
      const brush = brushes[id];

      if (!brush) throw new Error('Brush does not exist');

      delete brushes[id];

      onBrush({ ...brushes }, 'Remove', id);
    },
    [brushes, onBrush],
  );

  // ##################################################################### //
  // ############################## Creation ############################# //
  // ##################################################################### //

  const creationMouseDownHandler = useCallback(
    (event: React.MouseEvent<SVGRectElement, MouseEvent>) => {
      const dimensions = event.currentTarget.getBoundingClientRect();

      const extents: Extents = extentToData({
        x1: event.clientX - dimensions.left,
        x2: event.clientX - dimensions.left,
        y1: event.clientY - dimensions.top,
        y2: event.clientY - dimensions.top,
      });

      const brush: Brush = {
        id: getBrushId(),
        extents,
      };

      setMouseDownCreation(true);
      setActiveBrush(brush);
      //
    },
    [extentToData],
  );

  const creationMouseMoveHandler = useCallback(
    (event: MouseEvent) => {
      const targetNode = overlayRef.current;

      if (!targetNode || !activeBrush) return;

      const { left, top } = targetNode.getBoundingClientRect();

      const { x1, y2 } = extentToPixel(activeBrush.extents);

      const x2 = event.clientX - left;
      const y1 = event.clientY - top;

      // if (x2 < 0) x2 = 0;

      // if (x2 >= width) x2 = right;

      // if (y2 < 0) y2 = 0;

      // if (y2 >= height) y2 = bottom;
      // right, bottom, height, width

      activeBrush.extents = extentToData({ x1, x2, y1, y2 });

      setActiveBrush({ ...activeBrush });
      //
    },
    [activeBrush, extentToData, extentToPixel],
  );

  const creationMouseUpHandler = useCallback(() => {
    if (!activeBrush) return;

    let { x1, x2, y1, y2 } = activeBrush.extents;

    const isNewBrushRedundant = Math.abs(x1 - x2) < 0.00001 || Math.abs(y1 - y2) < 0.00001;

    if (!isNewBrushRedundant) {
      if (x1 > x2) [x1, x2] = [x2, x1];

      if (y1 > y2) [y1, y2] = [y2, y1];

      activeBrush.extents = correctBrushExtents({ x1, x2, y1, y2 });

      brushes[activeBrush.id] = activeBrush;

      onBrush({ ...brushes }, 'Add', activeBrush.id);
    }

    setActiveBrush(null);
    setMouseDownCreation(false);
  }, [activeBrush, brushes, onBrush]);

  // ##################################################################### //
  // ################################ Move ############################### //
  // ##################################################################### //

  const moveMouseDownHandler = useCallback(
    (event: React.MouseEvent<SVGRectElement, MouseEvent>, id: string) => {
      const targetNode = overlayRef.current;

      if (!targetNode || mouseDownCreation) return;

      const brush = brushes[id];

      if (!brush) throw new Error('Something went wrong! Brush does not exist.');

      const { left, top } = targetNode.getBoundingClientRect();
      const { x1: x, y2: y } = extentToPixel(brush.extents);

      const [currX, currY] = [event.clientX - left, event.clientY - top];
      const [diffX, diffY] = [Math.abs(currX - x), Math.abs(currY - y)];

      setDiff({ x: diffX, y: diffY });
      setActiveBrush(brush);
      setMouseDownMove(true);
    },
    [brushes, mouseDownCreation, extentToPixel],
  );

  const moveMouseMoveHandler = useCallback(
    (event: MouseEvent) => {
      const targetNode = overlayRef.current;

      if (!targetNode || !activeBrush || !diff) return;

      let { x1, x2, y1, y2 } = extentToPixel(activeBrush.extents);
      // [x1, x2, y1, y2] = [x1 * width, x2 * width, y1 * height, y2 * height];

      const [brushHeight, brushWidth] = [Math.abs(y2 - y1), Math.abs(x2 - x1)];

      const { x: diffX, y: diffY } = diff;

      const { left, top } = targetNode.getBoundingClientRect();

      let [newX, newY] = [event.clientX - left - diffX, event.clientY - top - diffY];

      if (newX < 0) newX = 0;

      if (newX + brushWidth > width) newX = width - brushWidth;

      if (newY < 0) newY = 0;

      if (newY + brushHeight > height) newY = height - brushHeight;

      [x1, x2, y2, y1] = [newX, newX + brushWidth, newY, newY + brushHeight];

      setActiveBrush({ ...activeBrush, extents: extentToData({ x1, x2, y1, y2 }) });
    },
    [activeBrush, diff, extentToPixel, extentToData, height, width],
  );

  const moveMouseUpHandler = useCallback(() => {
    if (!activeBrush) return;

    brushes[activeBrush.id] = activeBrush;

    onBrush({ ...brushes }, 'Update', activeBrush.id);

    setActiveBrush(null);
    setMouseDownMove(false);
  }, [activeBrush, brushes, onBrush]);

  // ##################################################################### //
  // ############################### Resize ############################## //
  // ##################################################################### //

  const resizeMouseDownHandler = useCallback(
    (brushId: string, direction: ResizeDirection) => {
      const brush = brushes[brushId];

      if (!brush) throw new Error('Something went wrong! Brush does not exist.');

      setActiveBrush(brush);
      setMouseDownResize(true);
      setResizeDirection(direction);
    },
    [brushes],
  );

  const resizeMouseMoveHandler = useCallback(
    (event: MouseEvent) => {
      const targetNode = overlayRef.current;

      if (!targetNode || !activeBrush || !resizeDirection) return;

      const { left, top } = targetNode.getBoundingClientRect();

      let { x1, x2, y1, y2 } = extentToPixel(activeBrush.extents);

      switch (resizeDirection) {
        case 'N':
          y2 = event.clientY - top;
          break;
        case 'S':
          y1 = event.clientY - top;
          break;
        case 'W':
          x1 = event.clientX - left;
          break;
        case 'E':
          x2 = event.clientX - left;
          break;
        case 'NW':
          x1 = event.clientX - left;
          y2 = event.clientY - top;
          break;
        case 'NE':
          y2 = event.clientY - top;
          x2 = event.clientX - left;
          break;
        case 'SW':
          x1 = event.clientX - left;
          y1 = event.clientY - top;
          break;
        case 'SE':
          y1 = event.clientY - top;
          x2 = event.clientX - left;
          break;
        default:
          throw new Error('Wrong Resize Direction');
      }

      activeBrush.extents = extentToData({ x1, x2, y1, y2 });

      setActiveBrush({ ...activeBrush });
    },
    [activeBrush, resizeDirection, extentToPixel, extentToData],
  );

  const resizeMouseUpHandler = useCallback(() => {
    if (!activeBrush) return;

    activeBrush.extents = correctBrushExtents(activeBrush.extents);

    brushes[activeBrush.id] = activeBrush;

    onBrush({ ...brushes }, 'Update', activeBrush.id);
    setActiveBrush(null);
    setResizeDirection(null);
    setMouseDownResize(false);
  }, [activeBrush, brushes, onBrush]);

  // ##################################################################### //
  // ############################## Effects ############################## //
  // ##################################################################### //

  useEffect(() => {
    if (!mouseDownCreation && !mouseDownMove && !mouseDownResize) return;

    if (mouseDownCreation) {
      window.addEventListener('mousemove', creationMouseMoveHandler);
      window.addEventListener('mouseup', creationMouseUpHandler);
    }

    if (mouseDownMove) {
      window.addEventListener('mousemove', moveMouseMoveHandler);
      window.addEventListener('mouseup', moveMouseUpHandler);
    }

    if (mouseDownResize) {
      window.addEventListener('mousemove', resizeMouseMoveHandler);
      window.addEventListener('mouseup', resizeMouseUpHandler);
    }

    return () => {
      if (mouseDownCreation) {
        window.removeEventListener('mousemove', creationMouseMoveHandler);
        window.removeEventListener('mouseup', creationMouseUpHandler);
      }

      if (mouseDownMove) {
        window.removeEventListener('mousemove', moveMouseMoveHandler);
        window.removeEventListener('mouseup', moveMouseUpHandler);
      }

      if (mouseDownResize) {
        window.removeEventListener('mousemove', resizeMouseMoveHandler);
        window.removeEventListener('mouseup', resizeMouseUpHandler);
      }
    };
  }, [
    mouseDownCreation,
    creationMouseMoveHandler,
    creationMouseUpHandler,
    mouseDownMove,
    moveMouseMoveHandler,
    moveMouseUpHandler,
    mouseDownResize,
    resizeMouseUpHandler,
    resizeMouseMoveHandler,
  ]);

  // ##################################################################### //
  // ############################## Elements ############################# //
  // ##################################################################### //

  const renderActiveBrush = useCallback(() => {
    if (!activeBrush) return <g />;

    const { x1, x2, y1, y2 } = correctBrushExtents(extentToPixel(activeBrush.extents));

    return (
      <RectBrush
        closeHandler={closeBrushHandler}
        height={y2 - y1}
        id={activeBrush.id}
        width={x2 - x1}
        x={x1}
        y={y1}
        onMouseDown={moveMouseDownHandler}
        onResizeStart={resizeMouseDownHandler}
      />
    );
  }, [activeBrush, moveMouseDownHandler, resizeMouseDownHandler, closeBrushHandler, extentToPixel]);

  const overlay = (
    <rect
      ref={overlayRef}
      cursor={disableBrush ? 'default' : 'crosshair'}
      fill="none"
      height={height}
      pointerEvents={disableBrush ? 'none' : 'all'}
      width={width}
      onMouseDown={creationMouseDownHandler}
    />
  );

  let brushList = Object.values(brushes);

  if (activeBrush) brushList = brushList.filter((b) => b.id !== activeBrush.id);

  const renderedBrushes = (
    <g>
      {renderActiveBrush()}
      {Object.values(brushList).map((brush) => {
        const { x1, x2, y1, y2 } = extentToPixel(brush.extents);

        return (
          <RectBrush
            key={brush.id}
            closeHandler={closeBrushHandler}
            height={y1 - y2}
            id={brush.id}
            width={x2 - x1}
            x={x1}
            y={y2}
            onMouseDown={moveMouseDownHandler}
            onResizeStart={resizeMouseDownHandler}
          />
        );
      })}
    </g>
  );

  const [bottomLayer, topLayer] = mouseDownCreation
    ? [renderedBrushes, overlay]
    : [overlay, renderedBrushes];

  return (
    <g id="brush-component">
      {bottomLayer}
      {topLayer}
    </g>
  );
};

export default BrushComponent;

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
