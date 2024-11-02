import { useState, useEffect } from 'react';
import axios from 'axios';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    // Check login status on component mount
    axios
      .get('http://localhost:3001/status', { withCredentials: true })
      .then((response) => {
        if (response.data.loggedIn) {
          setLoggedIn(true);
          setUserEmail(response.data.email);
        }
      })
      .catch((error) => {
        console.error('Error checking login status:', error);
      });
  }, []);

  const handleLogin = async () => {
    try {
      const response = await axios.post(
        'http://localhost:3001/login',
        { email, password },
        { withCredentials: true }
      );
      setLoggedIn(true);
      setUserEmail(email);
      alert(response.data.message);
    } catch (error) {
      alert(error.response?.data?.message || 'Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3001/logout', {}, { withCredentials: true });
      setLoggedIn(false);
      setUserEmail('');
      alert('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Login with Redis and Next.js</h1>
      {loggedIn ? (
        <>
          <p>Welcome, {userEmail}</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <button onClick={handleLogin}>Login</button>
        </>
      )}
    </div>
  );
}
