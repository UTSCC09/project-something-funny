  import redis from '../../lib/redisClient';
  export default async function getMessages(req, res) {
  const {course} = req.query;
  if (!course) 
    return res.status(400).json({ success: false, message: 'Must include course' });

  try {
    const messages = await redis.smembers(`courses:${course}:messages`);
    res.status(200).json({success: true, messages});
  } 
  catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
  }
