const statusEl = document.getElementById('status');

function showMessage(message, type = 'error') {
  if (!statusEl) return;
  statusEl.innerHTML = `<div class="message" style="background:${type === 'success' ? '#ecf9ef' : '#ffefef'}; color:${type === 'success' ? '#1e462f' : '#6f1f1f'}">${message}</div>`;
}

async function postJson(endpoint, data) {
  const response = await fetch(`/api/auth/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(data)
  });

  let payload;

  try {
    payload = await response.json();
  } catch {
    payload = {
      message: `Server returned ${response.status}`
    };
  }

  if (!response.ok) {
    throw new Error(payload.message || 'Request failed');
  }

  return payload;
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('email')?.value?.trim();
  const password = document.getElementById('password')?.value;
  if (!email || !password) {
    return showMessage('Please fill in both email and password.');
  }

  try {
    await postJson('login', { email, password });
    showMessage('Login successful. Redirecting...', 'success');
    window.location.href = '/';
  } catch (error) {
    showMessage(error.message);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById('name')?.value?.trim();
  const email = document.getElementById('email')?.value?.trim();
  const password = document.getElementById('password')?.value;
  if (!name || !email || !password) {
    return showMessage('Please fill in name, email, and password.');
  }

  try {
    await postJson('register', { name, email, password });
    showMessage('Registration successful. Redirecting...', 'success');
    window.location.href = '/';
  } catch (error) {
    showMessage(error.message);
  }
}

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
if (loginForm) loginForm.addEventListener('submit', handleLogin);
if (registerForm) registerForm.addEventListener('submit', handleRegister);
