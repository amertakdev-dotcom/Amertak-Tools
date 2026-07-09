document.documentElement.style.visibility = 'hidden';

const DEFAULT_API_BASE = 'https://amertak-tools-f3zb.onrender.com';

function getApiBase() {
  const configuredBase = window.__AUTH_API_BASE__ || '';
  if (configuredBase) {
    return configuredBase.replace(/\/$/, '');
  }

  return DEFAULT_API_BASE;
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
  window.location.replace(`/register.html?next=${encodeURIComponent(next)}`);
  return false;
}());
