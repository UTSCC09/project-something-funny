// Base URL for your backend API
const BASE_URL = 'http://localhost:3000';

export async function login(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      const data = await response.json();
      return { success: true, email: data.email };
    } else {
      const error = await response.json();
      return { success: false, message: error.message };
    }
  } catch (error) {
    return { success: false, message: 'Failed to log in' };
  }
}

export async function register(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    if (response.ok) {
      return { success: true };
    } else {
      const error = await response.json();
      return { success: false, message: error.message };
    }
  } catch (error) {
    return { success: false, message: 'Failed to register' };
  }
}

export async function logout() {
  try {
    await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Failed to log out', error);
  }
}

