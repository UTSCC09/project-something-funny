import redis from '../../lib/redis';
const getPostById = async (req, res) => {
  try {
    const {course, postId} = req.query;
    let post = null;
    if (!course || !postId)
        return res.status(400).end("No course or post id was given.");

    post = await redis.hget(`courses:${course}:posts`, postId);
    return res.status(200).json(JSON.parse(post));
  } 
  catch (error) {
    return res.status(404).end("Error");
  }
};

export default getPostById;