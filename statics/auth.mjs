import { useState } from 'react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleAction = async (action) => {
    try {
      const response = await fetch(`/api/auth?action=${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  const handleVerifyEmail = async () => {
    try {
      const response = await fetch(`/api/auth?action=verify&email=${email}`, { method: 'GET' });
      const data = await response.json();
      setMessage(data.message);
    } catch (error) {
      console.error('Error:', error);
      setMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div className="auth-container">
      <h1>Authentication</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button onClick={() => handleAction('register')}>Register</button>
      <button onClick={() => handleAction('login')}>Login</button>
      <button onClick={() => handleAction('logout')}>Logout</button>
      <button onClick={handleVerifyEmail}>Verify Email</button>
      {message && <p className="message">{message}</p>}
    </div>
  );
}
