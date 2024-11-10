import styles from '../../../styles/Posts.module.css';
import {useRouter} from 'next/router';
import {useState, useEffect} from 'react';
import pdfjsLib from 'pdfjs-dist';
const imageExtensions = ['jpg', 'jpeg', 'png'];
const videoExtensions = ['mp4'];
const PostPage = () => {
  const router = useRouter();
  const {course, postId} = router.query; 
  const [post, setPost] = useState({});

  const viewAllPosts = (course) => {
    router.push(`/courses/${course}/`); 
  };

  const displayFile = (fileUrl, mimetype) => {
    if (!fileUrl || !mimetype) 
      return null;
    if (imageExtensions.some(type => mimetype.includes(type)))
      return <img src={fileUrl} alt="Image"/>;
    else if (videoExtensions.some(type => mimetype.includes(type)))
      return (<video controls> <source src={fileUrl} type={mimetype} /> </video>);
    else if (mimetype.includes("pdf")) {
    }
    return null;
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/getPostById?course=${course}&postId=${postId}`);
        const fetchedData = await response.json();
        setPost(fetchedData);  
      } 
      catch (error) {
        return (error);
      } 
    };
    fetchPosts();
  }, [course, postId]); 

  return (
    <div key={postId}>
    <h1>{course}</h1>
    <button onClick={()=>viewAllPosts(course)}>View all posts</button>
    <p className={styles.text}>{post.text}</p>
    {displayFile(post.fileUrl, post.mimetype)} 
    <h2>Comments</h2>
    </div>  
  );
};

export default PostPage;