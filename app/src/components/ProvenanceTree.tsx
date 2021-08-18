import { observer } from 'mobx-react';

const ProvenanceTree = () => {
  return (
    <div>Tree</div>
    // <ProvVis
    //   key={store.provenance.graph.root}
    //   current={store.provenance.graph.current}
    //   nodeMap={store.provenance.graph.nodes}
    //   prov={store.provenance}
    //   root={store.provenance.graph.root}
    //   undoRedoButtons
    // />
  );
};

export default observer(ProvenanceTree);
