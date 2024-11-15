import styles from '../../styles/Posts.module.css';
import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation'

const imageExtensions = ['jpg', 'jpeg', 'png'];
const videoExtensions = ['mp4'];

const GetPosts = ({course}) => {
  const [posts, setPosts] = useState({});
  const router = useRouter();
  
  const displayFile = (fileUrl, mimetype) => {
    if (!fileUrl || !mimetype) 
      return null;
    if (imageExtensions.some(type => mimetype.includes(type)))
      return <img className={styles.files} src={fileUrl} alt="Image"/>;
    else if (videoExtensions.some(type => mimetype.includes(type)))
      return (<video controls className={styles.files}> <source src={fileUrl} type={mimetype} /></video>);
    else if (mimetype.includes("pdf"))
      return (<p>PDF</p>)
    return null;
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/getPosts?course=${course}`);
        const fetchedData = await response.json();
        setPosts(fetchedData);  
      } 
      catch (error) {
        return (error);
      } 
    };
    fetchPosts();
  }, [course]); 

  const expandPost = (course, postId) => {
    router.push(`/courses/${course}/${postId}`); 
  };

  return (
    <div>
      <h2>All Posts</h2>
      <div className={styles.flex_layout}>
      {Object.entries(posts).map(([id, {text, fileUrl, mimetype}]) => (
        <div key={id} className={styles.post_layout}>
          <button className={styles.right_button} onClick={()=>expandPost(course, id)}>Expand</button>
          <p className={styles.text}>{text}</p>
          {displayFile(fileUrl, mimetype)}
      </div>
      ))}
      </div>
    </div>
  );
};

export default GetPosts;