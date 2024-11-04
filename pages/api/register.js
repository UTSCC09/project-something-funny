import redis from '../../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const { email, password } = req.body;

  // Check if the user already exists
  const existingUser = await redis.get(`user:${email}`);
  if (existingUser) return res.status(409).json({ error: 'User already exists' }); // 409 Conflict

  // Save the user (simplified for example purposes)
  await redis.set(`user:${email}`, JSON.stringify({ email, password }));

  // Send a verification email here (left as an exercise)
  res.status(201).json({ message: 'User registered successfully' }); // 201 Created
}
