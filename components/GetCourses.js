'use client'
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'; 
import Cookie from 'js-cookie';
export default function GetCourses() {
  const router = useRouter();
  const [coursesList, setCoursesList] = useState([]);
  const [enrolledCourses, setenrolledCourses] = useState([]);
  const email = Cookie.get('userEmail');

  useEffect(() => {
    async function getEnrolledCourses() {
      try {
        const response = await fetch(`/api/getEnrolledCourses?email=${email}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (response.ok) 
          setenrolledCourses(data.enrolledCourses); 
        else
        setenrolledCourses([]);
      } catch (error) {
        console.error("Error fetching enrolled courses for user:", error);
        setenrolledCourses([]);
      }
    }
    getEnrolledCourses();
  }, [email]);

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

  const enroll = async ({email, course}) => {
    try {
      const response = await fetch('/api/enrollInCourse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({email, course}),
      });
      const data = await response.json();
      if (response.ok) {
        setenrolledCourses((prevCourses) => [...prevCourses, course]);
      }
    } 
    catch (error) {
      console.log("Could not enroll in course");
    }
  };

  let remainingCourses = coursesList.filter(c => !enrolledCourses.includes(c));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold mb-4">Enrolled Courses</h2>
        <div className="flex flex-wrap gap-4">
          {enrolledCourses.map((course, idx) => (
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
            <div key={idx}>
              <Button variant="secondary" onClick={() => clickCourse(course)}>
                {course}
              </Button>
              <Button onClick={() => enroll({email, course})}>Enroll</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
