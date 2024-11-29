import redis from '../../lib/redisClient';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const upload = multer({ dest: './public/uploads/' });
export const config = { api: { externalResolver: true, bodyParser: false } };

const submitPost = async (req, res) => {
  upload.single('file')(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(400).json({ success: false, message: "File upload error." });
    }
    try {
      const { text, uid } = req.body;
      const course = req.query.course;
      let fileUrl = null;
      const uniqueId = uuidv4(); 
      const time = new Date().toISOString();

      if (!course) {
        return res.status(400).json({ success: false, message: "Course is required." });
      }

      if (!text) {
        return res.status(400).json({ success: false, message: "Text is required." });
      }
      if (!uid) {
        return res.status(400).json({ success: false, message: "Uid is required." });
      }

      if (req.file) {
        fileUrl = `/uploads/${req.file.filename}`;
        const mimetype = String(req.file.mimetype);
        await redis.hset(
          `courses:${course}:posts`,
          uniqueId,
          JSON.stringify({ time, text, fileUrl, mimetype, uid, upvotes: 0, downvotes: 0 })
        );
      } else {
        await redis.hset(
          `courses:${course}:posts`,
          uniqueId,
          JSON.stringify({ time, text, uid, upvotes: 0, downvotes: 0 })
        );
      }

      return res.status(200).json({
        success: true,
        message: "Submitted post.",
        data: {
          postId: uniqueId,
          time,
          text,
          uid,
          fileUrl,
          mimetype: req.file ? req.file.mimetype : null,
          upvotes: 0,
          downvotes: 0,
        },
      });
    } catch (error) {
      console.error("Error submitting post:", error);
      return res.status(500).json({ success: false, message: "Error: could not add to Redis." });
    }
  });
};

export default submitPost;
