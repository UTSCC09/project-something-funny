import redis from '../../lib/redisClient';

export default async function unenroll(req, res) {
  if (req.method === 'DELETE') {
    const {email, course} = req.body;
    if (!email || !course)
      return res.status(400).json({ success: false, message: `Require email and course` });

    try {
      const db = `users:${email}:enrolledCourses`;
      const output = await redis.srem(db, 0, course);
      if (output === 0)
        return res.status(404).json({ success: false, message: `Could not remove user from course` })
      return res.status(200).json({ success: true, message: `Removed from course` });
    } 
    catch (error) {
        return res.status(500).json({ success: false, message: `Error` });
      }
    } 
  else
    return res.status(400).json({ success: false, message: `Must be a delete request` });
}