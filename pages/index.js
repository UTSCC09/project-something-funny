import { auth } from "./firebase-config";
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { TextEditor } from './components/text-editor';
import 'react-quill/dist/quill.snow.css'; 

export default function Home() {

  useEffect(() => {
    signInAnonymously(auth);
    onAuthStateChanged(auth, user => {
      if (user) {
        console.log('User signed in: ', user.uid);
      }
    })
  }, []);

  return (
    <div className="App">
      <header>
        <button id="back">Go Back</button>
        <h1 id="CurrentCourse"> Google Docs Clone </h1>
        <link href="./styles/App.css" rel="stylesheet" key="test"/>
      </header>
      {}
      <TextEditor />
    </div>
  );
}