export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  res.clearCookie('session'); // Clear session cookie
  res.status(200).json({ message: 'Logged out successfully' });
}
