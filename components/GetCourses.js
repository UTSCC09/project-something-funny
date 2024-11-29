'use client'
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button'; 
import useAuthStore from '../hooks/useAuthStore'
export default function GetCourses() {
  const router = useRouter();
  const [coursesList, setCoursesList] = useState([]);
  const [enrolledCourses, setenrolledCourses] = useState([]);

  const user = useAuthStore((state) => state.user);
  const uid = user.uid;

  useEffect(() => {
    async function getEnrolledCourses() {
      try {
        const response = await fetch(`/api/getEnrolledCourses?uid=${uid}`, {
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
  }, [uid]);

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
    if (enrolledCourses.indexOf(course) !== -1)
      router.push(`/courses/${course}`); 
  };

  const unenroll = async ({uid, course}) => {
    try {
      const response = await fetch('/api/unenrollFromCourse', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({uid, course}),
      });
      if (response.ok)
        setenrolledCourses((allCourses) => allCourses.filter((c) => c !== course));
    } 
    catch (error) {
      console.log("Could not unenroll from course");
    }
  };

  const enroll = async ({uid, course}) => {
    try {
      const response = await fetch('/api/enrollInCourse', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({uid, course}),
      });
      const data = await response.json();
      if (response.ok)
        setenrolledCourses((allCourses) => [...allCourses, course]);
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
             <div key={course}>
              <Button variant="primary" onClick={() => clickCourse(course)}>
                {course}
              </Button>
              <Button onClick={() => unenroll({uid, course})}>Unenroll</Button>
            </div>
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
              <Button onClick={() => enroll({uid, course})}>Enroll</Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
