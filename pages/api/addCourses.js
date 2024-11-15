import redis from '../../lib/redisClient';

  export default async function addCourses(req, res) {
  if (req.method === 'POST') {
    const courses = req.body;
    try {
      const added = await redis.sadd('courses', ...courses.courses);
      return res.status(200).end();
    } 
    catch (error) {
      return res.status(500).end();
    }
  }
  }