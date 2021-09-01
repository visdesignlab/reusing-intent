import firebase from 'firebase/app';

import 'firebase/database';
import { firebaseConfig } from '../cred';

export function getFirebase() {
  const app = firebase.apps.length === 0 ? firebase.initializeApp(firebaseConfig) : firebase.app();

  const db = firebase.database(app);

  const ref = async (path: string | undefined) => {
    const snapshot = await db.ref(path).get();

    return snapshot.val();
  };

  return { app, db, ref };
}

export async function loadWorkflowFromFirebase(workflowId: string) {
  const { ref } = getFirebase();
  const workflow = await ref(workflowId);

  return workflow;
}
