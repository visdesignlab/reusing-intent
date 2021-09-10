/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { observer } from 'mobx-react';
import { useCallback } from 'react';

import { ProvVis } from '../library/trrack-vis';
import { useStore } from '../stores/RootStore';

import { eventConfig } from './utils/EventConfig';

const ProvenanceTree = () => {
  const {
    projectStore: { datasetVersionFromKey, dataset_id },
    exploreStore: { nodeCreationMap, provenance, approveNode, rejectNode, workflow },
  } = useStore();
  const { graph } = provenance;

  const changeCurrent = useCallback(
    (nodeId: string) => {
      provenance.goToNode(nodeId);
    },
    [provenance],
  );

  const addToWorkflow = useCallback(
    (id: string) => {
      if (workflow && !workflow.doesCurrentHaveWorkflow) {
        workflow.addToWorkflow(id);
      }
    },
    [workflow],
  );

  return (
    <ProvVis
      key={graph.root}
      addToWorkflow={addToWorkflow}
      approvedFunction={approveNode}
      backboneGutter={40}
      changeCurrent={changeCurrent}
      current={graph.current}
      currentDataset={datasetVersionFromKey(dataset_id)}
      ephemeralUndo={false}
      eventConfig={eventConfig}
      nodeCreationMap={nodeCreationMap}
      nodeMap={graph.nodes as any}
      prov={provenance as any}
      rejectedFunction={rejectNode}
      root={graph.root}
      width={250}
      undoRedoButtons
    />
  );
};

export default observer(ProvenanceTree);
