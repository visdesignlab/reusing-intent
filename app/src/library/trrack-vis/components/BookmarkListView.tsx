import { NodeID, ProvenanceGraph } from '@visdesignlab/trrack';
import { observer } from 'mobx-react';
import React from 'react';
import { NodeGroup } from 'react-move';

import { EventConfig } from '../Utils/EventConfig';
import translate from '../Utils/translate';

import BookmarkNode from './BookmarkNode';
import BookmarkTransitions from './BookmarkTransitions';

export type BookmarkListViewConfig<T, S extends string> = {
  graph?: ProvenanceGraph<T, S>;
  eventConfig?: EventConfig<S>;
  currentNode: NodeID;
};

function BookmarkListView<T, S extends string>({
  graph,
  eventConfig,
  currentNode,
}: BookmarkListViewConfig<T, S>) {
  if (graph === undefined) {
    return null;
  }

  const gutter = 15;
  const verticalSpace = 50;

  const bookmarks = [];

  const xOffset = gutter;
  const yOffset = verticalSpace;

  // eslint-disable-next-line no-restricted-syntax
  for (const j in graph.nodes) {
    if (graph.nodes[j].bookmarked) {
      bookmarks.push(graph.nodes[j]);
    }
  }

  return (
    <NodeGroup
      data={bookmarks}
      keyAccessor={(d) => d.label}
      {...BookmarkTransitions(xOffset, yOffset, bookmarks)}
    >
      {(innerBookmarks) => (
        <>
          {innerBookmarks.map((bookmark) => {
            const { data: d, key, state } = bookmark;

            return (
              <g key={key} transform={translate(state.x, state.y)}>
                <BookmarkNode
                  current={currentNode === d.id}
                  editAnnotations={false}
                  eventConfig={eventConfig}
                  node={d}
                  nodeMap={innerBookmarks}
                />
              </g>
            );
          })}
        </>
      )}
    </NodeGroup>
  );
}

export default observer(BookmarkListView);
