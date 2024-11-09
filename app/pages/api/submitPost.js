import redis from '../../lib/redis';
import multer from 'multer';  

const upload = multer({dest:'./uploads/'}); 
export const config = {api: {bodyParser: false}};

const submitPost = async (req, res) => {
upload.single('file') (req, res, async (err) => {
  if (err)
    return res.status(400).end("Error");
  try {
    let {text} = req.body; 
    let course = req.query.course;
    let fileUrl = null;
    let uniqueId = await redis.incr('IdDatabase'); 

    await redis.hset(`${course}:text`, uniqueId, text);

    if (req.file) 
      fileUrl = `/uploads/${req.file.filename}`;
    if (fileUrl) 
      await redis.hset(`${course}:files`, uniqueId, fileUrl);

    return res.status(200).end("Submitted post.");
  } 
  catch (error) {
    return res.status(500).end("Error: could not add to redis.")
  }
})};

export default submitPost;