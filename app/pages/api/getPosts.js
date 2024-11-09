import redis from '../../lib/redis';
const getPosts = async (req, res) => {
  try {
    const {course} = req.query;
    if (!course)
        return res.status(400).end("No course was given.");
    const text = await redis.hgetall(`${course}:text`);
    const files = await redis.hgetall(`${course}:files`);
    return res.status(200).json({text, files});
  } 
  catch (error) {
    return res.status(404).end("Error");
  }
};

export default getPosts;