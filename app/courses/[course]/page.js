'use client'
import GetPosts from '@/components/GetPosts';
import Navbar from "@/components/Navbar";
import { useRouter } from 'next/navigation';
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button'; 
import { Card } from '@/components/ui/card'; 
import { Textarea } from '@/components/ui/textarea'; 
import { Input } from '@/components/ui/input'; 
import useAuthStore from '../../../hooks/useAuthStore';

const CoursePage = ({ params }) => {
  const router = useRouter();
  const { course } = React.use(params); 
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const user = useAuthStore((state) => state.user);
  const uid = user ? user.uid : null;

  const fileRef = useRef(null);
  const pushToDocuments = () => {
    router.push(`/doc/?course=${course}`);
  };

  const addFile = (e) => {
    setFile(e.target.files[0]);
  };

  const changeText = (e) => {
    setText(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('text', text);
    formData.append('uid', uid);
    if (file) formData.append('file', file);

    try {
      const response = await fetch(`/api/submitPost?course=${course}`, {
        method: 'POST',
        body: formData,
      });
      const output = await response.json();
      if (response.ok) {
        setText('');
        setFile(null);
        setSubmitted(true);
        fileRef.current.value = ""; 
      }
    } catch (error) {

      setText('');
      setFile(null);
      setSubmitted(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Button variant="outline" onClick={() => router.push('/courses')} className="mb-4">
        Main Menu
      </Button>
      <Navbar />
      <h1 className="text-3xl font-semibold mb-4">{course}</h1>
      <h2 className="text-2xl mb-4">Edit a Document</h2>
      <Button className="mb-4" variant="outline" onClick={()=>pushToDocuments()}>Documents</Button>
      <h2 className="text-2xl mb-4">Create a Post</h2>
      <Card className="mb-6">
        <form onSubmit={handleSubmit} className="p-4">
          <div className="mb-4">
            <Textarea
              value={text}
              onChange={changeText}
              placeholder="Enter text"
              required
              className="w-full"
            />
          </div>
          <div className="flex items-center space-x-4">
            <Input
              type="file"
              accept="video/*,image/*,application/pdf"
              onChange={addFile}
              ref={fileRef}
            />
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Card>
      <GetPosts course={course} submitted={submitted} setSubmitted={setSubmitted} />
    </div>
  );
};

export default CoursePage;
