

import redis from '../../lib/redisClient';

export default async function upvotePost(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
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
    post.upvotes = (post.upvotes || 0) + 1;

    await redis.hset(`courses:${course}:posts`, postId, JSON.stringify(post));

    return res.status(200).json({ success: true, upvotes: post.upvotes });
  } catch (error) {
    console.error("Error upvoting post:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error." });
  }
}
