import redis from '../../lib/redisClient';

export default async function submitReaction(req, res) {
  console.log(req.body);
  if (req.method === "POST") {
    const {course, messageId, emoji} = req.body;

    if (!course || !messageId || !emoji) 
      return res.status(400).json({success: false, message: 'Must include course, message, and emoji'});

    try {
      await redis.hincrby(`courses:${course}:messages:${messageId}:reactions`, emoji, 1);
      res.status(200).json({success: true, message: 'Saved the reaction'});
    }
    catch (error) {
      res.status(500).json({success: false, message: error});
    }
  }

  else if (req.method === 'GET') {
    const {messageId, course} = req.query;
    if (!messageId || !course) 
      return res.status(400).json({success: false, message: 'Must include course and message'});
  
    try {
      const reactions = await redis.hgetall(`courses:${course}:messages:${messageId}:reactions`);
      return res.status(200).json({success: true, reactions});
    } 
    catch (error) {
      res.status(500).json({success: false, message: error});
    }
  } 
  else
    res.status(405).json({success: false, message: "Must be a GET or POST method"});

}
