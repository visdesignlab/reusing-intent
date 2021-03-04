/* eslint-disable @typescript-eslint/no-inferrable-types */
import {
  StateNode,
} from '@visdesignlab/trrack';
import React from 'react';
import { Animate } from 'react-move';

import { EventConfig } from '../Utils/EventConfig';

import { treeColor } from './Styles';

type BookmarkNodeProps<T, S extends string, A> = {
  current: boolean;
  node: StateNode<T, S, A>;
  nodeMap: any;
  editAnnotations: boolean;
  eventConfig?: EventConfig<S>;
}

function BookmarkNode<T, S extends string, A>({
  current,
  node,
  eventConfig,
}: BookmarkNodeProps<T, S, A>) {
  const radius = 5;
  const strokeWidth = 2;
  const textSize = 15;

  const cursorStyle = {
    cursor: 'pointer',
  } as React.CSSProperties;

  let glyph = (
    <circle
      className={treeColor(current)}
      r={radius}
      strokeWidth={strokeWidth}
      style={cursorStyle}
    />
  );

  const dropDownAdded = false;
  const { eventType } = node.metadata;

  if (eventConfig) {
    const { currentGlyph, backboneGlyph } = eventConfig[eventType];

    if (current) {
      glyph = (
        <g fontWeight="none" style={cursorStyle}>
          {currentGlyph}
        </g>
      );
    } else {
      glyph = (
        <g fontWeight="none" style={cursorStyle}>
          {backboneGlyph}
        </g>
      );
    }
  }

  let label: string = '';
  let annotate: string = '';

  if (node.artifacts
    && node.artifacts.annotations.length > 0
    && node.artifacts.annotations[0].annotation.length > 0) {
    annotate = node.artifacts.annotations[0].annotation;
  }

  label = node.label;

  if (annotate.length > 20) annotate = `${annotate.substr(0, 20)}..`;

  if (label.length > 20) label = `${label.substr(0, 20)}..`;

  return (
    <Animate
      enter={{
        opacity: [1],
      }}
      start={{ opacity: 0 }}
    >
      {() => (
        <>
          <g style={{ opacity: 1 }} >

            {glyph}

            <text
              dominantBaseline="middle"
              fontSize={textSize}
              fontWeight="bold"
              textAnchor="start"
              x={20}
              y ={0}
            >
              {label}
            </text>

            <text
              dominantBaseline="middle"
              fontSize={textSize}
              fontWeight="regular"
              textAnchor="start"
              x={dropDownAdded ? 10 : 0}
              y={20}
            >
              {annotate}
            </text>
          </g>
        </>
      )}
    </Animate>
  );
}

export default BookmarkNode;
