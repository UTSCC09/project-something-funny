import {useState, useEffect} from 'react';

const GetPosts = ({course}) => {
  const [posts, setPosts] = useState({text: {}, files: {}});

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

  // need to format
  return (
    <div>
      <h2>All Posts</h2>
      {Object.entries(posts.text).map(([id, text]) => (
        <div key={id}> {text} </div>
      ))}     
    </div>
  );
};

export default GetPosts;