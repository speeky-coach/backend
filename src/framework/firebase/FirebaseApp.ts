import { applicationDefault, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * https://firebase.google.com/docs/admin/setup
 */

export const firebaseApp = initializeApp({
  credential: applicationDefault(),
  // databaseURL: 'https://<DATABASE_NAME>.firebaseio.com',
});

export const firebaseAuth = getAuth(firebaseApp);

export const firestoreDb = getFirestore(firebaseApp);
