document.documentElement.style.visibility = 'hidden';

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:3001'
  : 'https://amertak-tools-f3zb.onrender.com';

window.amertakToolAuth = (async function protectToolPage() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      credentials: 'include',
      headers: { Accept: 'application/json' }
    });

    if (response.ok) {
      document.documentElement.style.visibility = '';
      return true;
    }
  } catch {
    // Redirect below when the auth check cannot be completed.
  }

  const next = `${window.location.pathname}${window.location.search}`;
  window.location.replace(`/login?next=${encodeURIComponent(next)}`);
  return false;
}());
