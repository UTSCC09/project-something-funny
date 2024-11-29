

import redis from '../../lib/redisClient';

export default async function deletePost(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const { course, postId, uid } = req.query;

  if (!course || !postId || !uid) {
    return res.status(400).json({ success: false, message: "Course, postId, and uid are required." });
  }

  try {
    const postJSON = await redis.hget(`courses:${course}:posts`, postId);
    if (!postJSON) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }
    const post = JSON.parse(postJSON);
    if (post.uid !== uid)
      return res.status(403).json({ success: false, message: "Invalid user: cannot delete" });
    const deleted = await redis.hdel(`courses:${course}:posts`, postId);
    if (deleted === 0) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    await redis.del(`courses:${course}:posts:${postId}:comments`);

    return res.status(200).json({ success: true, message: "Post deleted successfully." });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error." });
  }
}
