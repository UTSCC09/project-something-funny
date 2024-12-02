import redis from '../../lib/redisClient';

export default async function deleteNotification(req, res) {
if (req.method === 'DELETE') {
  const { sender, sendTo } = req.body;

  if (!sender || !sendTo)
    return res.status(400).json({ success: false, message: "sender and sendto are required."});

  try {
    await redis.hdel(`notifications:${sendTo}`, `sender:${sender}`);
    return res.status(200).json({ success: true, message: 'Deleted notifications' });
  } 
  catch (error) {
    return res.status(500).json({ success: false, message: "Internal Server Error." });
  }
}
}
