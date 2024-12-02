

import redis from '../../lib/redisClient';

export default async function upvoteComment(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const { course, postId, commentId } = req.query;

  if (!course || !postId || !commentId) {
    return res.status(400).json({ success: false, message: "Course, postId, and commentId are required." });
  }

  try {
    const commentJSON = await redis.hget(`courses:${course}:posts:${postId}:comments`, commentId);
    if (!commentJSON) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }

    const comment = JSON.parse(commentJSON);
    comment.upvotes = (comment.upvotes || 0) + 1;

    await redis.hset(`courses:${course}:posts:${postId}:comments`, commentId, JSON.stringify(comment));

    return res.status(200).json({ success: true, upvotes: comment.upvotes });
  } catch (error) {
    console.error("Error upvoting comment:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error." });
  }
}
