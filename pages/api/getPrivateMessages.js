import redis from '../../lib/redisClient';
export default async function getMessages(req, res) {
const {chatId, index} = req.query;
if (!chatId || !index) 
  return res.status(400).json({ success: false, message: 'Must include chatId and index' });

  try {
    let max_possible_index = 0;
    const messages = await redis.hgetall(`privateMessages:${chatId}:messages`);
    redis.hlen(`privateMessages:${chatId}:messages`).then((length) => {
      max_possible_index = Math.floor(length / 10);

      if (index > max_possible_index)
        return res.status(400).json({ success: false, message: "No more messages to load" });

      const parsedMessages = Object.keys(messages).map((key) => {return JSON.parse(messages[key])});
      parsedMessages.sort((d1, d2) => {
        const date1 = new Date(d1.date);  
        const date2 = new Date(d2.date); 
        return date1 - date2;
      });
      // get 10 messages
      const start = length - 10*(index+1) >= 0 ? length - 10*(index+1) : 0;
      const end = length - 10*(index) < length ? length - 10*(index) : length;
      const slicedMessages = parsedMessages.slice(start, end);
      res.status(200).json({success: true, messages: slicedMessages});
    });  
  } 
  catch (error) {
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}
