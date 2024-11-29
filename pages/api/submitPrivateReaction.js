import redis from '../../lib/redisClient';

export default async function submitPrivateReaction(req, res) {
  if (req.method === "POST") {
    const {chatId, messageId, emoji} = req.body;

    if (!chatId || !messageId || !emoji) 
      return res.status(400).json({success: false, message: 'Must include chatId, message, and emoji'});

    try {
      await redis.hincrby(`privateMessages:${chatId}:messages:${messageId}:reactions`, emoji, 1);
      res.status(200).json({success: true, message: 'Reaction was saved'});
    }
    catch (error) {
      res.status(500).json({success: false, message: error});
    }
  }

  else if (req.method === 'GET') {
    const {messageId, chatId} = req.query;
    if (!messageId || !chatId) 
      return res.status(400).json({success: false, message: 'Must include chatId and message'});
  
    try {
      const reactions = await redis.hgetall(`privateMessages:${chatId}:messages:${messageId}:reactions`);
      return res.status(200).json({success: true, reactions});
    } 
    catch (error) {
      res.status(500).json({success: false, message: error});
    }
  } 
  else
    res.status(405).json({success: false, message: "Must be a GET or POST method"});
}
