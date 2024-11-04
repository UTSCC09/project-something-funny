import redis from '../../../lib/redis';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method Not Allowed' });

  const { token, email } = req.query;

  // Retrieve the user data
  const userData = await redis.get(`user:${email}`);
  if (!userData) return res.status(404).json({ error: 'User not found' });

  const user = JSON.parse(userData);

  // Check if the token matches
  if (user.verificationToken !== token) return res.status(400).json({ error: 'Invalid verification token' });

  // Mark the user as verified
  user.verified = true;
  delete user.verificationToken; // Remove the token after verification
  await redis.set(`user:${email}`, JSON.stringify(user));

  res.status(200).json({ message: 'Email verified successfully' });
}
