

import redis from '../../lib/redisClient';

export default async function deleteComment(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const { course, postId, commentId } = req.query;

  if (!course || !postId || !commentId) {
    return res.status(400).json({ success: false, message: "Course, postId, and commentId are required." });
  }

  try {
    const deleted = await redis.hdel(`courses:${course}:posts:${postId}:comments`, commentId);
    if (deleted === 0) {
      return res.status(404).json({ success: false, message: "Comment not found." });
    }

    return res.status(200).json({ success: true, message: "Comment deleted successfully." });
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error." });
  }
}
