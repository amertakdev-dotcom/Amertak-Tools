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
    const response = await fetch(`/api/share/${encodeURIComponent(id)}`);
    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || 'File not found.');
    }

    const file = data.file;
    metaText.textContent = `${file.fileName || file.name} • ${formatBytes(file.size || 0)}`;
    
    const downloadUrl = `/api/download?id=${encodeURIComponent(id)}`;
    const category = file.category || 'other';
    
    let previewHtml = '';
    if (category === 'image') {
      previewHtml = `<img src="${downloadUrl}" alt="${file.fileName || file.name}" style="max-width:100%;border-radius:8px;margin:12px 0;">`;
    } else if (category === 'video') {
      previewHtml = `<video controls src="${downloadUrl}" style="max-width:100%;border-radius:8px;margin:12px 0;"></video>`;
    } else if (category === 'audio') {
      previewHtml = `<audio controls src="${downloadUrl}" style="width:100%;margin:12px 0;"></audio>`;
    } else if (category === 'pdf') {
      previewHtml = `<iframe src="${downloadUrl}" style="width:100%;height:500px;border:none;border-radius:8px;margin:12px 0;"></iframe>`;
    } else {
      const icon = getFileIcon(file.mimeType);
      previewHtml = `<div style="text-align:center;padding:40px;background:rgba(255,255,255,0.05);border-radius:8px;margin:12px 0;">${icon}<p style="margin-top:12px;color:rgba(255,255,255,0.6);">${file.mimeType || 'File'}</p></div>`;
    }
    
    downloadState.innerHTML = `
      <div class="share-card" style="display:block;">
        <strong>${file.fileName || file.name}</strong>
        <p>${file.description || 'No description provided.'}</p>
        ${previewHtml}
        <p style="font-size:12px;opacity:0.7;">Downloads: ${file.downloads || 0} • Expires: ${new Date(file.expiresAt).toLocaleDateString()}</p>
      </div>
      <a class="primary-link" href="${downloadUrl}" style="display:inline-block;margin-top:12px;padding:10px 14px;border-radius:999px;background:linear-gradient(135deg,var(--accent),var(--accent-2));color:white;text-decoration:none;">Download file</a>
    `;
  } catch (error) {
    downloadState.innerHTML = `<p class="empty-text">${error.message}</p>`;
  }
}

function formatBytes(bytes) {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let idx = 0;
  let size = value;
  while (size >= 1024 && idx < units.length - 1) { size /= 1024; idx++; }
  return `${size.toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

function getFileIcon(mimeType) {
  if (!mimeType) return '📄';
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎥';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📕';
  if (mimeType.includes('zip') || mimeType.includes('rar') || mimeType.includes('7z')) return '📦';
  if (mimeType.includes('text') || mimeType.includes('document')) return '📝';
  return '📄';
}

loadFile();
