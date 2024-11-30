'use client'
import { auth } from "../../firebase-auth/index";
/* import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'; */
import { useEffect, useState, Suspense} from 'react';
/* import useAuthStore from '../hooks/useAuthStore' */
import 'react-quill/dist/quill.snow.css'; 
import { lazy } from "react"
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import useAuthStore from '../../hooks/useAuthStore.js';

const TextEditor = lazy(() => import('./components/text-editor'));

export default function Home() {
/*   const user = useAuthStore((state) => state.user);
  const uid = user ? user.uid : null; */
  const router = useRouter();
  const [loadComponent, setLoadComponent] = useState(false);
  //Var to store the course name for display purposes
  const courseName = "sample-doc";
  //This use effect is just us signing in so we can edit the firebase. If we're integrating with
  //Firebase all that needs to change is to use the earlier sign in data. 

  const user = useAuthStore((state) => state.user);
  const uid = user.uid;

  console.log(user.uid);

  useEffect(() => {
    //const user = useAuthStore((state) => state.user);
    //const uid = user.uid;
    /* signInAnonymously(auth);
    onAuthStateChanged(auth, user => {
      if (user) {
        console.log('User signed in: ', user.uid);
      }
    }); */
   console.log('signed in?');
  }, []);

  const handleButtonClick = () => {
    setLoadComponent(true);
  }

  return (
    <div className="App">
      <header>
        <button id="back">Go Back</button>
        <h1 id="CurrentCourse"> Google Docs Clone </h1>
        <link href="../styles/App.css" rel="stylesheet" key="test"/>
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