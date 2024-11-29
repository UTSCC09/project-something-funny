import redis from '../../lib/redisClient';
export default async function getExistingChatUsers(req, res) {
  const {userId, uid} = req.query;
  try {
    const chatId = userId < uid ? userId+uid : uid+userId;
    const exists = await redis.hlen(`privateMessages:${chatId}:messages`);

    if (exists !== 0)
      return res.status(200).json({success: true, chatExists: true});
    else
      return res.status(200).json({success: true, chatExists: false});
  } 
  catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
