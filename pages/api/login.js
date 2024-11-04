import redis from '../../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { email, password } = req.body;
  const userData = await redis.get(`user:${email}`);

  if (!userData) return res.status(404).json({ error: 'User not found' }); // 404 Not Found

  const user = JSON.parse(userData);
  if (user.password !== password) return res.status(401).json({ error: 'Invalid credentials' }); // 401 Unauthorized

  // Return success with token or session management info
  res.status(200).json({ message: 'Login successful' });
}
