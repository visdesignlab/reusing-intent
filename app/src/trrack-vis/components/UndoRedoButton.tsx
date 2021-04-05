import { ProvenanceGraph } from '@visdesignlab/trrack';
import React from 'react';
import { Button } from 'semantic-ui-react';
import { style } from 'typestyle';

export type UndoRedoConfig<T, S extends string, A> = {
  undoCallback: () => void;
  redoCallback: () => void;
  graph?: ProvenanceGraph<T, S, A>;
};

const undoButtonStyle = style({
  marginTop: '2px',
  borderRadius: '2px',
  display: 'inline-block',
  cursor: 'pointer',
  fontFamily: 'Lato,Helvetica Neue,Arial,Helvetica,sans-serif',
  fontSize: '14px',
  marginRight: '1px',
  $nest: {
    '&:hover': {
      backgroundColor: '#6c7c7c',
    },
    '&:active': {
      backgroundColor: '#6c7c7c',
    },
  },
});

const redoButtonStyle = style({
  marginTop: '2px',
  borderRadius: '2px',
  display: 'inline-block',
  cursor: 'pointer',
  fontFamily: 'Lato,Helvetica Neue,Arial,Helvetica,sans-serif',
  fontSize: '14px',

  $nest: {
    '&:hover': {
      backgroundColor: '#6c7c7c',
    },

    '&:active': {
      backgroundColor: '#6c7c7c',
    },
  },
});

function UndoRedoButton<T, S extends string, A>({
  graph,
  undoCallback,
  redoCallback,
}: UndoRedoConfig<T, S, A>) {
  if (graph === undefined) {
    return null;
  }

  const isAtRoot = graph.root === graph.current;
  const isAtLatest = graph.nodes[graph.current].children.length === 0;

  const margin = {
    marginRight: '3px',
  } as React.CSSProperties;

  return (
    <div>
      <Button
        className={undoButtonStyle}
        disabled={isAtRoot}
        variant="outlined"
        onClick={undoCallback}
      >
        <i className="fas fa-undo marginRight" style={margin} />
        Undo
      </Button>

      <Button
        className={redoButtonStyle}
        disabled={isAtLatest}
        variant="outlined"
        onClick={redoCallback}
      >
        <i className="fas fa-redo marginRight" style={margin} />
        Redo
      </Button>
    </div>
  );
}

export default UndoRedoButton;
