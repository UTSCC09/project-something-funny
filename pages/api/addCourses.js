import redis from '../../lib/redisClient';

  export default async function addCourses(req, res) {
  if (req.method === 'POST') {
    const courses = req.body;
    try {
      const added = await redis.sadd('courses', ...courses.courses);
      return res.status(200).json({message: 'Added courses', added: added});
    } 
    catch (error) {
      return res.status(500).json({message: 'Could not add courses'});
    }
  }
  }