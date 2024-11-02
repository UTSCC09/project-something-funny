import express from 'express';
import Redis from 'redis';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { v4 as uuidv4 } from 'uuid';

// Initialize the app and Redis client
const app = express();
const redisClient = Redis.createClient();
redisClient.connect();

app.use(bodyParser.json());
app.use(cookieParser());

// A simple in-memory user database for demo purposes
const users = {
  'user@example.com': 'password123',
};

// Route for login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // Check if the email and password match
  if (users[email] && users[email] === password) {
    const sessionId = uuidv4();
    
    // Store the session in Redis
    await redisClient.set(sessionId, email, 'EX', 3600); // Session expires in 1 hour
    
    // Send the session ID as a cookie
    res.cookie('sessionId', sessionId, { httpOnly: true });
    res.json({ message: 'Logged in successfully' });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
});

// Route for logout
app.post('/logout', async (req, res) => {
  const { sessionId } = req.cookies;
  if (sessionId) {
    // Remove the session from Redis
    await redisClient.del(sessionId);
    res.clearCookie('sessionId');
  }
  res.json({ message: 'Logged out successfully' });
});

// Route to check login status
app.get('/status', async (req, res) => {
  const { sessionId } = req.cookies;
  if (sessionId) {
    const email = await redisClient.get(sessionId);
    if (email) {
      return res.json({ loggedIn: true, email });
    }
  }
  res.json({ loggedIn: false });
});

// Start the server
app.listen(3000, () => {
  console.log('Backend running on http://localhost:3000');
});


