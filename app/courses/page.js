'use client'
import GetCourses from '@/components/GetCourses';
import Navbar from '@/components/Navbar';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; 

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const courses = ["CSCC01", "CSCC09", "CSCC10", "CSCC11", "CSCC24", "CSCC37", "CSCC43", "CSCC63", 
      "CSCC69", "CSCC73", "CSCC85", "CSCD01", "CSCD03", "CSCD18", "CSCD27", "CSCD37", "CSCD43", "CSCD58",
      "CSCD84"];
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
      <Button variant="outline" onClick={() => router.push('/')} className="mb-4">
        Main Menu
      </Button>
      <Navbar/>
      <div className="p-5">
        <h1 className="text-4xl font-bold text-center mb-4">Courses</h1>
        <GetCourses />
      </div>
    </div>
  );
}
