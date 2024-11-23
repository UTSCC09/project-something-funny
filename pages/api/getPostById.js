

import redis from '../../lib/redisClient';

export default async function getPostById(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const { course, postId } = req.query;

  if (!course || !postId) {
    return res.status(400).json({ success: false, message: "Course and postId are required." });
  }

  try {
    const postJSON = await redis.hget(`courses:${course}:posts`, postId);
    if (!postJSON) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    const post = JSON.parse(postJSON);

    const commentsJSON = await redis.hgetall(`courses:${course}:posts:${postId}:comments`);
    const comments = commentsJSON ? Object.fromEntries(
      Object.entries(commentsJSON).map(([commentId, commentStr]) => [commentId, JSON.parse(commentStr)])
    ) : {};

    return res.status(200).json({ success: true, post: { ...post, comments } });
  } catch (error) {
    console.error("Error fetching post:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error." });
  }
}
