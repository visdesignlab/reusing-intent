import firebase from 'firebase/app';

import 'firebase/database';
import { firebaseConfig } from '../cred';
import { CustomWorkflow } from '../stores/WorkflowStore';

export function getFirebase() {
  const app = firebase.apps.length === 0 ? firebase.initializeApp(firebaseConfig) : firebase.app();

  const db = firebase.database(app);

  const ref = async (path: string | undefined) => {
    const snapshot = await db.ref(path).get();

    return snapshot;
  };

  return { app, db, ref };
}

export async function loadWorkflowFromFirebase(workflowId: string) {
  const { ref } = getFirebase();
  const workflow: Workflow = (await ref(workflowId)).val();

  return workflow;
}

export async function checkIfWorkflowExists(id: string) {
  const { ref } = getFirebase();

  return (await ref(id)).exists();
}

type Workflow = {
  id: string;
  project: string;
  project_name: string;
  order: string[];
  name: string;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graph: any;
};

export async function syncWorkflow(wf: Workflow | CustomWorkflow) {
  const update = {
    [`/${wf.id}`]: wf,
  };

  const { db } = getFirebase();

  db.ref().update(update);
}

export async function getAllCustomWorkflows(pid: string) {
  const { ref } = getFirebase();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wfs: CustomWorkflow[] = Object.values((await ref('/')).val() || {});

  return wfs.filter((d) => d.type === 'Custom' && d.project === pid);
}
