
import redis from '../../lib/redisClient';
import { v4 as uuidv4 } from 'uuid';

export default async function addComment(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const { course, postId, uid } = req.query;
  const { text } = req.body;

  if (!course || !postId || !uid) {
    return res.status(400).json({ success: false, message: "Course, postId, and uid are required." });
  }

  if (!text || !text.trim()) {
    return res.status(400).json({ success: false, message: "Comment text is required." });
  }

  try {
    const commentId = uuidv4(); 
    const time = new Date().toISOString();
    const comment = {
      time,
      uid,
      text: text.trim(),
      upvotes: 0,
      downvotes: 0,
    };

    await redis.hset(
      `courses:${course}:posts:${postId}:comments`,
      commentId,
      JSON.stringify(comment)
    );

    return res.status(200).json({
      success: true,
      message: "Comment added successfully.",
      data: {
        commentId,
        ...comment,
      },
    });
  } catch (error) {
    console.error("Error adding comment:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error." });
  }
}
