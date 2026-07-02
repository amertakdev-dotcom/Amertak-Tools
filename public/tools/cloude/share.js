const params = new URLSearchParams(window.location.search);
const id = params.get('id') || window.location.pathname.split('/').filter(Boolean).pop();
const metaText = document.getElementById('metaText');
const downloadState = document.getElementById('downloadState');

async function loadFile() {
  if (!id) {
    downloadState.innerHTML = '<p class="empty-text">No file id provided.</p>';
    return;
  }

  try {
    const response = await fetch(`/api/file?id=${encodeURIComponent(id)}`);
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'File not found.');
    }

    const file = data.file;
    metaText.textContent = `${file.name} • ${Math.round((file.size || 0) / 1024)} KB`;
    downloadState.innerHTML = `
      <div class="share-card" style="display:block;">
        <strong>${file.name}</strong>
        <p>${file.description || 'No description provided.'}</p>
        <p>Type: ${file.mimeType || 'application/octet-stream'}</p>
        <p>Downloads: ${file.downloads || 0}</p>
      </div>
      <a class="primary-link" href="/api/download?id=${encodeURIComponent(id)}" style="display:inline-block;margin-top:12px;padding:10px 14px;border-radius:999px;background:linear-gradient(135deg,var(--accent),var(--accent-2));color:white;text-decoration:none;">Download file</a>
    `;
  } catch (error) {
    downloadState.innerHTML = `<p class="empty-text">${error.message}</p>`;
  }
}

loadFile();
