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

app.get('/', (req, res) => {
  res.send('Welcome to the Auth Service!');
});

const sendVerificationEmail = (email, token) => {
  const verificationLink = `http://localhost:3000/verify?token=${token}`;
  const mailOptions = {
    from: 'your-email@gmail.com',
    to: email,
    subject: 'Email Verification',
    text: `Please verify your email by clicking on the following link: ${verificationLink}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Route for registration
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  
  if (users[email]) {
    return res.status(400).json({ message: 'Email is already registered' });
  }

  const verificationToken = uuidv4();
  
  // Store the user in the "database" with a verification status
  users[email] = {
    password,
    verified: false,
    verificationToken,
  };

  sendVerificationEmail(email, verificationToken);

  res.json({ message: 'Registration successful. Please check your email to verify your account.' });
});

app.get('/verify', (req, res) => {
  const { token } = req.query;

  const user = Object.values(users).find(u => u.verificationToken === token);
  if (!user) {
    return res.status(400).json({ message: 'Invalid verification token' });
  }

  user.verified = true;
  user.verificationToken = null; 

  res.json({ message: 'Email verified successfully. You can now log in.' });
});

// Route for login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (users[email] && users[email] === password) {
    const sessionId = uuidv4();
    
    await redisClient.set(sessionId, email, 'EX', 3600); // Session expires in 1 hour
    
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
    await redisClient.del(sessionId);
    res.clearCookie('sessionId');
  }
  res.json({ message: 'Logged out successfully' });
});

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


