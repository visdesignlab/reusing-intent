import { isChildNode, NodeID } from '@visdesignlab/trrack';
import 'firebase/database';

import  firebase  from 'firebase';

import { WorkflowType } from '../../Store/ExploreStore';

import { IntentGraph, IntentNode } from './../../Store/Types/ProvenanceType';

const config = {
  apiKey: 'AIzaSyB8jzc6Gck2Rt-rrw-ZbACudr5VqESRNRY',
  authDomain: 'reusing-intent.firebaseapp.com',
  projectId: 'reusing-intent',
  storageBucket: 'reusing-intent.appspot.com',
  messagingSenderId: '290275127628',
  appId: '1:290275127628:web:e332ddfe7bada09cff5fe9',
  measurementId: 'G-K9KB7W1VM3',
};

export function initializeFirebase() {
  const app: firebase.app.App =
    firebase.apps.length === 0 ? firebase.initializeApp(config) : firebase.app();

  const db = firebase.database(app);

  return {
    config,
    app,
    db,
  };
}

export function storeToFirebase(
  id: string,
  graph: IntentGraph,
  workflow: WorkflowType,
  db: firebase.database.Database,
  sync: (key: string, val: string) => void,
) {
  const wf = {
    id: workflow.id,
    name: workflow.name,
    graph: getGraph(graph, workflow.graph),
  };

  db.ref(`${id}`)
    .set(wf)
    .then(() => {
      sync(id, JSON.stringify(workflow));
    });
}

export function loadFromFirebase(db: firebase.database.Database, workflowId: string){
  return db
    .ref(workflowId)
    .once('value')
}

function getGraph(graph: IntentGraph, ids: NodeID[]) {
  const root = graph.root;

  const current = ids[ids.length - 1];

  const nodes: IntentNode = {};
  nodes[graph.root] = graph.nodes[graph.root];

  ids.forEach((id, idx, arr) => {
    const node = graph.nodes[id];

    if (isChildNode(node)) {
      if (idx === 0) {
        node.parent = root;
        nodes[root].children = [];
        nodes[root].children.push(id);
      } else {
        const parent = arr[idx - 1];
        node.parent = parent;
        nodes[parent].children = [];
        nodes[parent].children.push(id);
      }
    }

    nodes[id] = node;
  });

  return {
    current,
    root,
    nodes,
  };
}
