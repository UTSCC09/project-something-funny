import { login, register, logout, checkStatus } from './api.mjs';

// Elements from the DOM
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutButton = document.getElementById('logout-button');

// Initial setup to check login status and update UI
async function initialize() {
    const { loggedIn } = await response.json();
    if (loggedIn) {
        showLogout();
    } else {
        showLogin();
    }
}

function showLoginRegister() {
  loginForm.style.display = 'block';
  registerForm.style.display = 'block';
  logoutButton.style.display = 'none';
}

function showLogout(email) {
  loginForm.style.display = 'none';
  registerForm.style.display = 'none';
  logoutButton.style.display = 'block';
  document.getElementById('welcome-message').innerText = `Welcome, ${email}`;
}

// Handle login form submission
loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const response = await login(email, password);
  if (response.success) {
    showLogout(response.email);
  } else {
    alert(response.message);
  }
});

// Handle register form submission
registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  const response = await register(email, password);
  if (response.success) {
    alert('Registration successful. Please log in.');
    showLoginRegister();
  } else {
    alert(response.message);
  }
});

// Handle logout button click
logoutButton.addEventListener('click', async () => {
  await logout();
  showLoginRegister();
});

// Initialize the UI
initialize();
