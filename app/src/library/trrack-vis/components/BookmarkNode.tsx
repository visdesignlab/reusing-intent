/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Animate } from 'react-move';

import { treeColor } from './Styles';

function BookmarkNode({ current, node, eventConfig }: any) {
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

  if (
    node.artifacts &&
    node.artifacts.annotations.length > 0 &&
    node.artifacts.annotations[0].annotation.length > 0
  ) {
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
          <g style={{ opacity: 1 }}>
            {glyph}

            <text
              dominantBaseline="middle"
              fontSize={textSize}
              fontWeight="bold"
              textAnchor="start"
              x={20}
              y={0}
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
