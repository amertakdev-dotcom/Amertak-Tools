document.documentElement.style.visibility = 'hidden';

window.amertakToolAuth = (async function protectToolPage() {
  try {
    const response = await fetch('/api/auth/me', {
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
