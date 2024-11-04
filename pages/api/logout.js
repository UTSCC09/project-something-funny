export default function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  
    // Clear session or token logic
    res.status(200).json({ message: 'Logged out successfully' });
  }
  