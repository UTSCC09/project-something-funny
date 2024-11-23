

import redis from '../../lib/redisClient';

export default async function getPosts(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Method ${req.method} Not Allowed` });
  }

  const { course } = req.query;

  if (!course) {
    return res.status(400).json({ success: false, message: "Course is required." });
  }

  try {
    const posts = await redis.hgetall(`courses:${course}:posts`);
    if (!posts) {
      return res.status(404).json({ success: false, message: "No posts found for this course." });
    }

    const parsedPosts = Object.fromEntries(
      Object.entries(posts).map(([id, value]) => {
        const { time, text, fileUrl, mimetype, upvotes, downvotes } = JSON.parse(value);
        return [id, { time, text, fileUrl, mimetype, upvotes, downvotes }];
      })
    );

    return res.status(200).json({ success: true, posts: parsedPosts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error." });
  }
}
