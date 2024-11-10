import redis from '../../lib/redis';
const getPosts = async (req, res) => {
  try {
    const {course} = req.query;
    let posts = [];
    if (!course)
        return res.status(400).end("No course was given.");
    posts = await redis.hgetall(`${course}:posts`);
    const parsedPosts = Object.fromEntries(
      Object.entries(posts).map(([id, value]) => {
        const {time, text, fileUrl, mimetype} = JSON.parse(value);
        return ([id, {time, text, fileUrl, mimetype}]);
      })
    );
    return res.status(200).json(parsedPosts);
  } 
  catch (error) {
    return res.status(404).end("Error");
  }
};

export default getPosts;