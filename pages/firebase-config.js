// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAWgJGJ9lRE3jy8zUgj0H3iY3BQNJUbSKU",
  authDomain: "gdocs-2b265.firebaseapp.com",
  projectId: "gdocs-2b265",
  storageBucket: "gdocs-2b265.firebasestorage.app",
  messagingSenderId: "435419224641",
  appId: "1:435419224641:web:770d1a9d41cddeaa5884c0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);