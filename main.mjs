const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutButton = document.getElementById('logout-button');

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  const response = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  if (response.ok) {
    alert(data.message);
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
    logoutButton.style.display = 'block';
  } else {
    alert(data.error);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;

  const response = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();
  if (response.ok) {
    alert(data.message);
  } else {
    alert(data.error);
  }
}

function handleLogout() {
  fetch('/api/logout')
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      loginForm.style.display = 'block';
      registerForm.style.display = 'block';
      logoutButton.style.display = 'none';
    });
}

loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);
logoutButton.addEventListener('click', handleLogout);
