import redis from '../../../lib/redis';
import { compare } from 'bcrypt'; // Import bcrypt's compare function for password checking

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { email, password } = req.body;
  const userData = await redis.get(`user:${email}`);

  if (!userData) return res.status(404).json({ error: 'User not found' }); // 404 Not Found

  const user = JSON.parse(userData);

  // Check password using bcrypt
  const isPasswordValid = await compare(password, user.password);
  if (!isPasswordValid) return res.status(401).json({ error: 'Invalid credentials' }); // 401 Unauthorized

  // You can set a session or token here. For now, just return success.
  res.status(200).json({ message: 'Login successful' });
}
