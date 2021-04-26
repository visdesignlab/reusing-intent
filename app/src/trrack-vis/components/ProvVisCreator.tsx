/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { NodeID, Provenance, ProvenanceGraph } from '@visdesignlab/trrack';
import { configure } from 'mobx';
import ReactDOM from 'react-dom';

import { BundleMap, OriginMap } from '../Utils/BundleMap';
import { EventConfig } from '../Utils/EventConfig';

import ProvVis from './ProvVis';
import UndoRedoButton from './UndoRedoButton';

export type ProvVisConfig = {
  eventConfig: EventConfig<any>;
  editAnnotations: boolean;
  bundleMap: BundleMap;
  iconOnly: boolean;
  iconSize: number;
  height: number;
  width: number;
  sideOffset: number;
  backboneGutter: number;
  gutter: number;
  verticalSpace: number;
  regularCircleRadius: number;
  backboneCircleRadius: number;
  regularCircleStroke: number;
  backboneCircleStroke: number;
  topOffset: number;
  textSize: number;
  linkWidth: number;
  duration: number;
};
configure({ isolateGlobalState: true });
export function ProvVisCreator<T, S extends string, A>(
  node: Element,
  prov: Provenance<T, S, A>,
  currentDataset: string,
  approvedFunction: (id: NodeID) => void,
  rejectedFunction: (id: NodeID) => void,
  nodeCreationMap: OriginMap,
  callback?: (id: NodeID) => void,
  brushCallback?: (selected: string[]) => void,
  ephemeralUndo = false,
  fauxRoot: NodeID = prov.graph.root,

  config: Partial<ProvVisConfig> = {},
) {
  prov.addGlobalObserver(() => {
    ReactDOM.render(
      <ProvVis
        {...config}
        // eslint-disable-next-line no-console
        addToWorkflow={(id: string) => console.log(id)}
        approvedFunction={approvedFunction}
        brushCallback={brushCallback}
        changeCurrent={callback}
        current={prov.graph.current}
        currentDataset={currentDataset}
        ephemeralUndo={ephemeralUndo}
        nodeCreationMap={nodeCreationMap}
        nodeMap={prov.graph.nodes}
        prov={prov}
        rejectedFunction={rejectedFunction}
        root={fauxRoot}
        undoRedoButtons
      />,
      node,
    );
  });

  ReactDOM.render(
    <ProvVis
      {...config}
      // eslint-disable-next-line no-console
      addToWorkflow={(id: string) => console.log(id)}
      approvedFunction={approvedFunction}
      brushCallback={brushCallback}
      changeCurrent={callback}
      current={prov.graph.current}
      currentDataset={currentDataset}
      ephemeralUndo={ephemeralUndo}
      nodeCreationMap={nodeCreationMap}
      nodeMap={prov.graph.nodes}
      prov={prov}
      rejectedFunction={rejectedFunction}
      root={fauxRoot}
      undoRedoButtons
    />,
    node,
  );
}

export function UndoRedoButtonCreator<T, S extends string, A>(
  node: Element,
  graph: ProvenanceGraph<T, S, A>,
  undoCallback: () => void,
  redoCallback: () => void,
) {
  ReactDOM.render(
    <UndoRedoButton graph={graph} redoCallback={redoCallback} undoCallback={undoCallback} />,
    node,
  );
}
