'use client'
import { auth } from "../../firebase-auth/index";
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { useEffect } from 'react';
import { TextEditor } from './components/text-editor';
import 'react-quill/dist/quill.snow.css'; 

export default function Home() {
    //Var to store the course name for display purposes
    const courseName = "sample-doc";

//This use effect is just us signing in so we can edit the firebase. If we're integrating with
//Firebase all that needs to change is to use the earlier sign in data. 
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