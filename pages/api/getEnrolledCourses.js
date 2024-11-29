import redis from '../../lib/redisClient';

export default async function getPosts(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, message: `Must be a GET method` });
  }
  const {uid} = req.query;
  if (!uid)
    return res.status(400).json({success: false, message: "uid is required"});
  try {
    const enrolledCourses = await redis.smembers(`users:${uid}:enrolledCourses`);
    if (!enrolledCourses) 
      return res.status(404).json({ success: false, message: "No enrolled courses found for this user" });
    return res.status(200).json({success: true, enrolledCourses: enrolledCourses});
  } 
  catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
