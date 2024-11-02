import { createClient } from 'redis';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

// Initialize Redis client
const redisClient = createClient();
await redisClient.connect();

export default async function handler(req, res) {
  const { action } = req.query;

  if (req.method === 'POST') {
    const { email, password } = req.body;

    if (action === 'register') {
      // Handle Registration
      const existingUser = await redisClient.hGet(`user:${email}`, 'email');
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      await redisClient.hSet(`user:${email}`, {
        email,
        password: hashedPassword,
        verified: false,
      });

      // Mock sending an email verification
      return res.status(200).json({ message: 'Registration successful. Please verify your email.' });
    }

    if (action === 'login') {
      // Handle Login
      const storedUser = await redisClient.hGetAll(`user:${email}`);
      if (!storedUser || !storedUser.password) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const isPasswordValid = await bcrypt.compare(password, storedUser.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      if (storedUser.verified !== 'true') {
        return res.status(403).json({ message: 'Email not verified' });
      }

      const sessionToken = uuidv4();
      await redisClient.set(`session:${sessionToken}`, email, { EX: 3600 });

      res.setHeader('Set-Cookie', `token=${sessionToken}; HttpOnly; Path=/; Max-Age=3600`);
      return res.status(200).json({ message: 'Login successful' });
    }

    if (action === 'logout') {
      // Handle Logout
      const token = req.cookies.token;
      if (token) {
        await redisClient.del(`session:${token}`);
        res.setHeader('Set-Cookie', 'token=; HttpOnly; Path=/; Max-Age=0');
        return res.status(200).json({ message: 'Logout successful' });
      }
      return res.status(400).json({ message: 'No session found' });
    }
  }

  if (req.method === 'GET' && action === 'verify') {
    // Handle Email Verification
    const { email } = req.query;
    const userKey = `user:${email}`;
    const user = await redisClient.hGetAll(userKey);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await redisClient.hSet(userKey, 'verified', 'true');
    return res.status(200).json({ message: 'Email verified successfully' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
}
