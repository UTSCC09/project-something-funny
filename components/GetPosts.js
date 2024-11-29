
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; 
import { Card } from '@/components/ui/card'; 
import { ThumbsUp,ThumbsDown } from 'lucide-react';
import useAuthStore from '../hooks/useAuthStore';
const imageExtensions = ['jpg', 'jpeg', 'png'];
const videoExtensions = ['mp4'];

const GetPosts = ({ course, submitted, setSubmitted }) => {
  const [posts, setPosts] = useState({});
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const uid = user.uid;
  
  const displayFile = (fileUrl, mimetype) => {
    if (!fileUrl || !mimetype) return null;
    if (imageExtensions.some(type => mimetype.includes(type)))
      return <img src={fileUrl} alt="Image" className="max-w-xs h-auto rounded" />;
    else if (videoExtensions.some(type => mimetype.includes(type)))
      return <video controls className="w-full max-h-64 rounded"><source src={fileUrl} type={mimetype} /></video>;
    else if (mimetype.includes("pdf"))
      return <p className="text-blue-500">PDF Document</p>;
    return null;
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/getPosts?course=${course}`);
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  useEffect(() => {
    const updatePostList = async () => {
      await fetchPosts();  
      setSubmitted(false); 
    };
    updatePostList();
  }, [submitted, course]);

  const upvotePost = async (postId) => {
    try {
      const response = await fetch(`/api/upvotePost?course=${course}&postId=${postId}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        fetchPosts(); 
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error upvoting post:", error);
    }
  };

  const downvotePost = async (postId) => {
    try {
      const response = await fetch(`/api/downvotePost?course=${course}&postId=${postId}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        fetchPosts(); 
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error downvoting post:", error);
    }
  };

  const deletePost = async (postId) => {
    try {
      const response = await fetch(`/api/deletePost?course=${course}&postId=${postId}&uid=${uid}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchPosts(); 
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log("Error deleting post:", error);
    }
  };

  const addComment = async (postId, text) => {
    try {
      const response = await fetch(`/api/addComment?course=${course}&postId=${postId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (data.success) {
        fetchPosts(); 
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const upvoteComment = async (postId, commentId) => {
    try {
      const response = await fetch(`/api/upvoteComment?course=${course}&postId=${postId}&commentId=${commentId}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        fetchPosts();
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error upvoting comment:", error);
    }
  };

  const downvoteComment = async (postId, commentId) => {
    try {
      const response = await fetch(`/api/downvoteComment?course=${course}&postId=${postId}&commentId=${commentId}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
        fetchPosts(); 
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error downvoting comment:", error);
    }
  };

  const deleteComment = async (postId, commentId) => {
    try {
      const response = await fetch(`/api/deleteComment?course=${course}&postId=${postId}&commentId=${commentId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        fetchPosts(); 
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const expandPost = (course, postId) => {
    router.push(`/courses/${course}/${postId}`); 
  };


  const handleDeleteComment = (postId, commentId) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteComment(postId, commentId);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">All Posts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(posts).map(([id, { text, fileUrl, mimetype, upvotes, downvotes, comments }]) => (
          <Card key={id} className="flex flex-col">
            <div className="p-4 flex-1">
              <p className="mb-2">{text}</p>
              {displayFile(fileUrl, mimetype)}
            </div>
            <div className="p-4 flex flex-col space-y-2">
              <div className="flex justify-between">

                <div>
                  <Button variant="secondary" onClick={() => upvotePost(id)}>
                    <ThumbsUp/>
                  </Button>
                  <span className='pl-2'>{upvotes || 0}</span>
                </div>

                <div>
                  <Button variant="secondary" onClick={() => downvotePost(id)}>
                  <ThumbsDown/>
                  </Button>
                  <span className='pl-2'>{downvotes || 0}</span>
                </div>
               

              </div>
              <Button variant="destructive" onClick={() => deletePost(id)}>Delete</Button>
              <Button variant="outline" onClick={() => expandPost(course, id)}>
                Expand
              </Button>

     


              {comments && Object.entries(comments).map(([commentId, { text: commentText, upvotes: commentUpvotes, downvotes: commentDownvotes }]) => (
                <Card key={commentId} className="p-2 mt-2">
                  <p>{commentText}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Button variant="secondary" size="small" onClick={() => upvoteComment(id, commentId)}>Upvote</Button>
                    <span>{commentUpvotes || 0}</span>
                    <Button variant="secondary" size="small" onClick={() => downvoteComment(id, commentId)}>Downvote</Button>
                    <span>{commentDownvotes || 0}</span>
                    <Button variant="danger" size="small" onClick={() => handleDeleteComment(id, commentId)}>Delete</Button>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GetPosts;
