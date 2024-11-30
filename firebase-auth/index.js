
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyCaUv37KllYy40ULWnh8RtfaseBE6AZtFs",
  authDomain: "toronto-grand-library.firebaseapp.com",
  projectId: "toronto-grand-library",
  storageBucket: "toronto-grand-library.firebasestorage.app",
  messagingSenderId: "756263348997",
  appId: "1:756263348997:web:c413a03350604bfc12656c"
};

let firebaseApp;

if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export { auth };