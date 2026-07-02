function getApiBase() {
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') {
    return 'https://amertak-tools-f3zb.onrender.com';
  }
  return '';
}

const API_BASE = getApiBase();

function getStoredAuthToken() {
  return localStorage.getItem('authToken') || '';
}

function persistAuthSession(data) {
  if (data?.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }

  const token = data?.token || data?.accessToken || data?.authToken || '';
  if (token) {
    localStorage.setItem('authToken', token);
  }
}

function buildAuthHeaders(extra = {}) {
  const headers = { ...extra };
  const token = getStoredAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

function showMessage(message, isError = false) {
  const status = document.getElementById('status');
  if (!status) return;
  status.innerHTML = `<div class="message" style="${isError ? 'background:#ffe8e8;color:#8f1d1d;' : 'background:#eafaf0;color:#17653a;'}">${message}</div>`;
}

function setLoading(isLoading) {
  const form = document.getElementById('loginForm') || document.getElementById('registerForm');
  const buttons = form?.querySelectorAll('button');
  buttons?.forEach((button) => {
    button.disabled = isLoading;
    button.style.opacity = isLoading ? '0.7' : '1';
  });
}

async function handleLogin(event) {
  event.preventDefault();
  const form = document.getElementById('loginForm');
  if (!form) return;

  const email = document.getElementById('email')?.value.trim() || '';
  const password = document.getElementById('password')?.value || '';

  if (!email || !password) {
    showMessage('Please enter both email and password.', true);
    return;
  }

  setLoading(true);
  showMessage('Signing you in...');

  try {
    const response = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Login failed.');
    }

    if (data.user || data.token || data.accessToken || data.authToken) {
      persistAuthSession(data);
      const next = new URLSearchParams(window.location.search).get('next') || '/';
      window.location.href = next;
      return;
    }

    throw new Error('No user returned from the server.');
  } catch (error) {
    showMessage(error.message || 'Unable to connect to the server.', true);
  } finally {
    setLoading(false);
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const form = document.getElementById('registerForm');
  if (!form) return;

  const name = document.getElementById('name')?.value.trim() || '';
  const email = document.getElementById('email')?.value.trim() || '';
  const password = document.getElementById('password')?.value || '';

  if (!name || !email || !password) {
    showMessage('Please complete all fields.', true);
    return;
  }

  setLoading(true);
  showMessage('Creating your account...');

  try {
    const response = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include',
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed.');
    }

    if (data.user || data.token || data.accessToken || data.authToken) {
      persistAuthSession(data);
      window.location.href = '/';
      return;
    }

    throw new Error('No user returned from the server.');
  } catch (error) {
    showMessage(error.message || 'Unable to connect to the server.', true);
  } finally {
    setLoading(false);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
});
