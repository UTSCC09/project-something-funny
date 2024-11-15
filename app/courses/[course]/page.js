'use client'
import styles from '../../../styles/Courses.module.css';
import globals from '../../../styles/globals.css';
import GetPosts from '../../components/GetPosts.js';
import {useRouter} from 'next/navigation';
import React, {useState} from 'react'

const CoursePage = ({params}) => {
  const router = useRouter();
  // const {course} = router.query; 
  const {course: course} = React.use(params);
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);

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
    if (file) 
      formData.append('file', file);
    
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
      }
    } 
    catch (error) {
      setText('');
      setFile(null);
      setSubmitted(true);
    }
  };

  return (
    <div>
      <a href="/courses">Main menu</a>
      <h1>{course}</h1>
      <h2>Create a Post</h2>
      <div>
        <form onSubmit={handleSubmit}>
        <div className={styles.flex_layout}>
          <div>
            <textarea className={styles.input_box} value={text} onChange={changeText} 
              placeholder="Enter text" required/>
          </div>
          <div>
            <input type="file" className={styles.file_button} accept="video/*,image/*,application/pdf" onChange={addFile}/>
            <button type="submit" className={styles.submit_button}>Submit</button>
            </div>
        </div>
      </form>
      </div>
      <GetPosts course={course} submitted={submitted} setSubmitted={setSubmitted}/>
    </div>
  );
};

export default CoursePage;