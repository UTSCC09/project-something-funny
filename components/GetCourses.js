'use client'
import styles from '../styles/Courses.module.css';
import {useRouter} from 'next/navigation'
import {useState, useEffect} from 'react';
export default function GetCourses() {
  const router = useRouter();
  const [coursesList, setCoursesList] = useState([]);
  
  // need to change: depends on logged in user
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
      } 
      catch (error) {
        setCoursesList([]);
      }
    }
    fetchCourses();
  }, []);

  const clickCourse = (course) => {
    router.push(`/courses/${course}`); 
  };
  let remainingCourses = coursesList.filter(c => !yourCourses.includes(c));
  return (
    <>
    <div>Enrolled Courses</div>
    <div className={styles.grid_layout}>
      {yourCourses.map((course, idx) => (
        <button className={styles.course_button} id={course} key={idx} onClick={()=>clickCourse(course)}>{course}</button>
      ))}
      </div>
    <div>All Courses</div>
    <div className={styles.grid_layout}>
      {remainingCourses.map((course, idx) => (
        <button className={styles.course_button} id={course} key={idx} onClick={()=>clickCourse(course)}>{course}</button>
      ))}
      </div>
    </>
  );
};