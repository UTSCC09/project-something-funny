import redis from '../../lib/redisClient';
export async function getAllUsers(req, res) {
  try {
    let cursor = "0";
    let users = [];
    let totalCount = "100";
    do {
      const [nextCursor, userKeys] = await redis.scan(cursor, "MATCH", "user:*", "COUNT", totalCount);
      cursor = nextCursor;
      for (const k of userKeys) {
        const userId = k.split(':')[1];
        const data = await redis.hgetall(k);
        if (data.email)
          users.push({userId, email: data.email});
      }
    } 
    while (cursor !== '0');

    res.status(200).json({success: true, users:users});
  } 
  catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
export default getAllUsers;
