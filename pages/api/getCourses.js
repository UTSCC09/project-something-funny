import redis from '../../lib/redisClient';

export default async function getCourses(req, res) {
  try {
    const courses = await redis.smembers('courses');
    res.status(200).json({courses});
  } 
  catch (error) {
    res.status(500).end("Could not get courses");
  }
}