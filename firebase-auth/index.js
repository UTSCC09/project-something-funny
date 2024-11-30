import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyC2AqlHoxZv1PMAQ9Z4gKcCuJUcjVUGAqg",
  authDomain: "utsclibrary-6ee82.firebaseapp.com",
  projectId: "utsclibrary-6ee82",
  storageBucket: "utsclibrary-6ee82.firebasestorage.app",
  messagingSenderId: "94684778391",
  appId: "1:94684778391:web:94aca197ea2d68e7317ed2",
  measurementId: "G-YH96T4JNKB"
};

let firebaseApp;

if (!getApps().length) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

const auth = getAuth(firebaseApp);
export const firebaseDB = getFirestore(firebaseApp);
export { auth };