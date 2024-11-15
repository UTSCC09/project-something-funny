import redis from '../../lib/redisClient';
import multer from 'multer';  

const upload = multer({dest:'./public/uploads/'}); 
export const config = {api: {externalResolver: true, bodyParser: false}};

const submitPost = async (req, res) => {
upload.single('file') (req, res, async (err) => {
  if (err)
    return res.status(400).json({message: "Error"});
  try {
    let {text} = req.body; 
    let course = req.query.course;
    let fileUrl = null;
    let uniqueId = await redis.incr('IdDatabase'); 
    let time = new Date().toISOString();

    if (!req.file) {
      await redis.hset(`courses:${course}:posts`, uniqueId, JSON.stringify({time, text}));
      return res.status(200).end("Submitted post.");
    }
    else {
      fileUrl = `/uploads/${req.file.filename}`;
      const file = req.file;
      const mimetype  = String(file.mimetype);
      if (fileUrl) {
        await redis.hset(`courses:${course}:posts`, uniqueId, JSON.stringify({time, text, fileUrl, mimetype}));
      }
      else {
        await redis.hset(`courses:${course}:posts`, uniqueId, JSON.stringify({time, text})); 
      }
      }
    return res.status(200).end("Submitted post.");
  } 
  catch (error) {
    return res.status(500).end("Error: could not add to redis.")
  }
})};

export default submitPost;