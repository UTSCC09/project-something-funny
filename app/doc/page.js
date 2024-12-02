'use client'
import 'react-quill/dist/quill.snow.css'; 
import Navbar from '@/components/Navbar';
import { auth } from "../../firebase-auth/index";
import { lazy, Suspense, useState, useEffect } from "react"
import {useRouter} from "next/navigation";
import useAuthStore from '../../hooks/useAuthStore.js';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import React from 'react';
import {useSearchParams} from 'next/navigation';
import { Button } from '@/components/ui/button'; 
const TextEditor = lazy(() => import('./components/text-editor'));

export default function Home({params}) {
  const [loadComponent, setLoadComponent] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const course = searchParams.get('course');
  const user = useAuthStore((state) => state.user);
  const uid = user ? user.uid : null;

  //This use effect is just us signing in so we can edit the firebase. If we're integrating with
  //Firebase all that needs to change is to use the earlier sign in data. 
  useEffect(() => {

  }, []);

  const handleButtonClick = () => {
    setLoadComponent(true);
    document.getElementById("loadDocument").style.display = "none";
  }

  return (
    <div className="App">
      <header>
        <Button className="mb-4" variant="outline" id="back" onClick={() => router.push('/courses')}>Go Back</Button>
        <Navbar/>
        <h1 id="CurrentCourse" className="mb-4"> {course} </h1>
        <link href="./styles/App.css" rel="stylesheet" key="test"/>
      </header>
      {}
      <Button variant="outline" id="loadDocument" onClick={handleButtonClick}>
        Do you want to view document?
      </Button>
      {/* {loadComponent && 
      (<Suspense fallback={<div>Loading...</div>}> */}
        <TextEditor course = {course} />
      {/* </Suspense>
      )} */}
    </div>
  );
};