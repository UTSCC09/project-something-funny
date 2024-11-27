  import redis from '../../lib/redisClient';
  export default async function getMessages(req, res) {
  const {course, index} = req.query;
  if (!course || !index) 
    return res.status(400).json({ success: false, message: 'Must include course and index' });

    try {
      const messages = await redis.smembers(`courses:${course}:messages`);
      const max_possible_index = Math.floor(messages.length / 10);

      // no more message to load
      if (index > max_possible_index)
        res.status(400).json({success: false});
      
      const parsedMessages = messages.map(message => JSON.parse(message));
      parsedMessages.sort((d1, d2) => {
        const date1 = new Date(d1.date);  
        const date2 = new Date(d2.date); 
        return date1 - date2;
      });
      // get 10 messages
      const start = messages.length - 10*(index+1) >= 0 ? messages.length - 10*(index+1) : 0;
      const end = messages.length - 10*(index) < messages.length ? messages.length - 10*(index) : messages.length;
      const slicedMessages = parsedMessages.slice(start, end);
      res.status(200).json({success: true, messages: slicedMessages});
    } 
    catch (error) {
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }
