import 'firebase/database';

import firebase from 'firebase/app';

import { WorkflowType } from '../../Store/ExploreStore';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('browserify-fs');


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

export function storeToFirebase(id: string, workflow: WorkflowType, db: firebase.database.Database)
{
    //this doesnt work
    fs.writeFile(`${id}.json`, JSON.stringify(workflow), (d: any) => {
        console.log("saved locally", d)
    })

    db
    .ref(`${id}`)
    .set(workflow)
    .then(() => {
        console.log("done!");
    });
}


