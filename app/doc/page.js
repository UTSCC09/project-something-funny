'use client'
import { auth } from "../../firebase-auth/index";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from 'next/navigation';
import useAuthStore from '../../hooks/useAuthStore.js';
import { useEffect, useState, Suspense} from 'react';
import 'react-quill/dist/quill.snow.css'; 
import { lazy } from "react"

const TextEditor = lazy(() => import('./components/text-editor'));

export default function Home() {
  const [loadComponent, setLoadComponent] = useState(false);

  const user = useAuthStore((state) => state.user);
  const uid = user ? user.uid : null

  //Var to store the course name for display purposes
  const courseName = "sample-doc";

  //This use effect is just us signing in so we can edit the firebase. If we're integrating with
  //Firebase all that needs to change is to use the earlier sign in data. 
  useEffect(() => {
  }, []);

  const handleButtonClick = () => {
    setLoadComponent(true);
  }

  return (
    <div className="App">
      <header>
        <button id="back">Go Back</button>
        <h1 id="CurrentCourse"> Google Docs Clone </h1>
        <link href="./styles/App.css" rel="stylesheet" key="test"/>
      </header>
      {}
      <button id="load document" onClick={handleButtonClick}>
        Do you want to view document?
      </button>
      {loadComponent && 
      (<Suspense fallback={<div>Loading...</div>}>
        <TextEditor />
      </Suspense>)
      }
    </div>
  );
}