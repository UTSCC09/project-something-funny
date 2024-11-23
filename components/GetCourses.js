'use client'
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'; 

export default function GetCourses() {
  const router = useRouter();
  const [coursesList, setCoursesList] = useState([]);
  
  let yourCourses = ["CSCC09"];

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch('/api/getCourses');
        const data = await response.json();
        if (response.ok) 
          setCoursesList(data.courses); 
        else
          setCoursesList([]);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setCoursesList([]);
      }
    }
    fetchCourses();
  }, []);

  const clickCourse = (course) => {
    router.push(`/courses/${course}`); 
  };

  const remainingCourses = coursesList.filter(c => !yourCourses.includes(c));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Enrolled Courses</h2>
        <div className="flex flex-wrap gap-4">
          {yourCourses.map((course, idx) => (
            <Button key={idx} variant="primary" onClick={() => clickCourse(course)}>
              {course}
            </Button>
          ))}
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">All Courses</h2>
        <div className="flex flex-wrap gap-4">
          {remainingCourses.map((course, idx) => (
            <Button key={idx} variant="secondary" onClick={() => clickCourse(course)}>
              {course}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
