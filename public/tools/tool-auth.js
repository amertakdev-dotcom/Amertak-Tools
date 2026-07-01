document.documentElement.style.visibility = 'hidden';

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

function buildAuthHeaders(extra = {}) {
  const headers = { ...extra };
  const token = getStoredAuthToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

window.amertakToolAuth = (async function protectToolPage() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      credentials: 'include',
      headers: buildAuthHeaders({ Accept: 'application/json' })
    });

    if (response.ok) {
      document.documentElement.style.visibility = '';
      return true;
    }
  } catch {
    // Redirect below when the auth check cannot be completed.
  }

  const next = `${window.location.pathname}${window.location.search}`;
  window.location.replace(`/login.html?next=${encodeURIComponent(next)}`);
  return false;
}());
