'use client';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import DisplayPDF from '@/components/DisplayPDF';
import { Button } from '@/components/ui/button'; 
import { Card } from '@/components/ui/card'; 
import { Textarea } from '@/components/ui/textarea'; 
import React from 'react';
import useAuthStore from '../../../../hooks/useAuthStore';
const imageExtensions = ['jpg', 'jpeg', 'png'];
const videoExtensions = ['mp4'];

const PostPage = ({ params }) => {
  const router = useRouter();
  const { course, postId } = React.use(params); 
  const [post, setPost] = useState({});
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState('');
  const [error, setError] = useState(null);
  const user = useAuthStore((state) => state.user);
  const uid = user.uid;

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/getPostById?course=${course}&postId=${postId}`);
        const data = await response.json();
        if (data.success) {
          setPost(data.post);
          setComments(data.post.comments || {});
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };
    fetchPost();
  }, [course, postId]);


  const displayFile = (fileUrl, mimetype) => {
    if (!fileUrl || !mimetype) return null;
    if (imageExtensions.some(type => mimetype.includes(type)))
      return <img src={fileUrl} alt="Image" className="max-w-full h-auto rounded" />;
    else if (videoExtensions.some(type => mimetype.includes(type)))
      return (
        <div className="my-4">
          <video controls className="w-full max-h-96">
            <source src={fileUrl} type={mimetype} />
          </video>
          <h2 className="text-xl mt-2">Video Comments</h2>
        </div>
      );
    else if (mimetype.includes("pdf"))
      return <DisplayPDF fileUrl={fileUrl} />;
    return null;
  };


  const viewAllPosts = (course) => {
    router.push(`/courses/${course}/`); 
  };


  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!commentText.trim()) {
      setError("Comment cannot be empty.");
      return;
    }

    try {
      const response = await fetch(`/api/addComment?course=${course}&postId=${postId}&uid=${uid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: commentText }),
      });

      const data = await response.json();
      if (data.success) {
        setCommentText('');

        const refreshedPostResponse = await fetch(`/api/getPostById?course=${course}&postId=${postId}`);
        const refreshedData = await refreshedPostResponse.json();
        if (refreshedData.success) {
          setPost(refreshedData.post);
          setComments(refreshedData.post.comments || {});
        }
      } else {
        setError(data.message || "Failed to add comment.");
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
      setError("An error occurred while submitting the comment.");
    }
  };


  const handleUpvoteComment = async (commentId) => {
    try {
      const response = await fetch(`/api/upvoteComment?course=${course}&postId=${postId}&commentId=${commentId}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {
 
        setComments(prevComments => ({
          ...prevComments,
          [commentId]: {
            ...prevComments[commentId],
            upvotes: data.upvotes,
          }
        }));
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error upvoting comment:", error);
    }
  };


  const handleDownvoteComment = async (commentId) => {
    try {
      const response = await fetch(`/api/downvoteComment?course=${course}&postId=${postId}&commentId=${commentId}`, {
        method: 'POST',
      });
      const data = await response.json();
      if (data.success) {

        setComments(prevComments => ({
          ...prevComments,
          [commentId]: {
            ...prevComments[commentId],
            downvotes: data.downvotes,
          }
        }));
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error downvoting comment:", error);
    }
  };


  const handleDeleteComment = async (commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      const response = await fetch(`/api/deleteComment?course=${course}&postId=${postId}&commentId=${commentId}&uid=${uid}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
  
        setComments(prevComments => {
          const updatedComments = { ...prevComments };
          delete updatedComments[commentId];
          return updatedComments;
        });
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button variant="outline" onClick={() => viewAllPosts(course)} className="mb-4">
        View All Posts
      </Button>
      <h1 className="text-3xl font-semibold mb-2">{course}</h1>
      <Card className="mb-6">
        <div className="p-4">
          <p className="mb-4">{post.text}</p>
          {displayFile(post.fileUrl, post.mimetype)} 
          {post.mimetype === "application/pdf" && (
            <div id="pdf_buttons" className="flex items-center space-x-2 mt-4">
              <Button id="prev" variant="secondary">Previous</Button>
              <Button id="next" variant="secondary">Next</Button>
              <p>
                Page: <span id="page_number">1</span> / <span id="total_pages">0</span>
              </p>
            </div>
          )}
        </div>
      </Card>
      
      <h2 className="text-2xl mb-4">Comments</h2>
      <Card className="mb-6 p-4">
        <form onSubmit={handleCommentSubmit} className="flex flex-col space-y-4">
          <Textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Enter your comment"
            required
            className="w-full"
          />
          {error && <p className="text-red-500">{error}</p>}
          <Button type="submit">Submit Comment</Button>
        </form>
      </Card>


      <div className="space-y-4">
        {Object.keys(comments).length === 0 && <p>No comments yet. Be the first to comment!</p>}
        {Object.entries(comments).map(([commentId, comment]) => (
          <Card key={commentId} className="p-4">
            <p>{comment.text}</p>
            <div className="flex items-center space-x-2 mt-2">
              <Button variant="secondary" size="small" onClick={() => handleUpvoteComment(commentId)}>Upvote</Button>
              <span>{comment.upvotes || 0}</span>
              <Button variant="secondary" size="small" onClick={() => handleDownvoteComment(commentId)}>Downvote</Button>
              <span>{comment.downvotes || 0}</span>
              <Button variant="danger" size="small" onClick={() => handleDeleteComment(commentId)}>Delete</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PostPage;
