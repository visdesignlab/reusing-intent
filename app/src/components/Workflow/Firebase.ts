import firebase from 'firebase';

import 'firebase/database';
import { WorkflowType } from '../../Store/ExploreStore';

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
  workflow: WorkflowType,
  db: firebase.database.Database,
  sync: (key: string, val: string) => void,
) {
  db.ref(`${id}`)
    .set(workflow)
    .then(() => {
      sync(id, JSON.stringify(workflow));
    });
}
