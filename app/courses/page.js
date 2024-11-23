'use client'
import GetCourses from '@/components/GetCourses';
import Navbar from '@/components/Navbar';
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    const courses = ["CSCC09", "CSCC10", "CSCC11", "CSCC37", "CSCC73", "CSCD01"];
    const addCoursesToDb = async () => {
      try {
        const response = await fetch('/api/getCourses');
        const data = await response.json();
        if (data.courses.length < courses.length) {
          const addResponse = await fetch('/api/addCourses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ courses }),
          });
          const added = await addResponse.json();
        }
      } catch (error) {
        console.error("Error adding courses:", error);
      }
    };
    addCoursesToDb();
  }, []);

  return (
    <div className="">
      <Navbar/>
      <div className="p-5">
        <h1 className="text-4xl font-bold text-center mb-4">Courses</h1>
        <GetCourses />
      </div>
    </div>
  );
}
