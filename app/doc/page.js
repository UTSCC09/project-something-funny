'use client'
import 'react-quill/dist/quill.snow.css'; 
import { auth } from "../../firebase-auth/index";
import { lazy, Suspense, useState, useEffect } from "react"
import {useRouter} from "next/navigation";
import useAuthStore from '../../hooks/useAuthStore.js';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import React from 'react';

const TextEditor = lazy(() => import('./components/text-editor'));

export default function Home({params}) {
  const [loadComponent, setLoadComponent] = useState(false);
  //Var to store the course name for display purposes
  const router = useRouter();

  //Try to pass the course here
  const {course} = React.use(params);
  console.log(course);

  const user = useAuthStore((state) => state.user);
  const uid = user ? user.uid : null;

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
        <button id="back" onClick={() => router.push('/courses')}>Go Back</button>
        <h1 id="CurrentCourse"> Google Docs Clone </h1>
        <link href="./styles/App.css" rel="stylesheet" key="test"/>
      </header>
      {}
      <button id="load document" onClick={handleButtonClick}>
        Do you want to view document?
      </button>
      {loadComponent && 
      (<Suspense fallback={<div>Loading...</div>}>
        {/* pass the course code over here */}
        <TextEditor course ={course} />
      </Suspense>)
      }
    </div>
  );
}