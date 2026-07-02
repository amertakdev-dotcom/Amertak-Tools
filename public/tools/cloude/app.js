const MAX_FILE_SIZE = 100 * 1024 * 1024;
const uploadList = document.getElementById('uploadList');
const resultArea = document.getElementById('resultArea');
const fileInput = document.getElementById('fileInput');
const dropZone = document.getElementById('dropZone');
const description = document.getElementById('description');
const toast = document.getElementById('toast');

function showToast(message, type = 'info') {
  if (!toast) return;
  toast.className = `toast show ${type}`;
  toast.textContent = message;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.className = 'toast';
  }, 2400);
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function filesToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read file.'));
    reader.readAsDataURL(file);
  });
}

function createUploadCard(file, progress, state) {
  const row = document.createElement('article');
  row.className = 'upload-row';
  row.innerHTML = `
    <div class="upload-row-main">
      <div>
        <strong>${file.name}</strong>
        <p>${formatBytes(file.size)}</p>
      </div>
      <span class="upload-status">${state}</span>
    </div>
    <div class="upload-progress"><span style="width:${progress}%"></span></div>
  `;
  return row;
}

async function uploadFiles(files) {
  if (!files.length) return;

  const pending = Array.from(files);
  const cards = [];

  uploadList.innerHTML = '';
  resultArea.innerHTML = '';
  resultArea.className = 'result-area';

  for (const [index, file] of pending.entries()) {
    if (file.size > MAX_FILE_SIZE) {
      showToast(`${file.name} exceeds 100MB limit.`, 'error');
      continue;
    }

    const card = createUploadCard(file, 0, 'Preparing');
    uploadList.appendChild(card);
    cards.push(card);

    try {
      const base64 = await filesToBase64(file);
      card.querySelector('.upload-status').textContent = 'Uploading';
      card.querySelector('.upload-progress span').style.width = '40%';

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          size: file.size,
          description: description.value.trim(),
          fileData: base64
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed.');
      }

      const uploaded = data.files?.[0] || data;
      card.querySelector('.upload-status').textContent = 'Done';
      card.querySelector('.upload-progress span').style.width = '100%';

      const linkCard = document.createElement('div');
      linkCard.className = 'share-card';
      linkCard.innerHTML = `
        <div>
          <strong>${uploaded.fileName || file.name}</strong>
          <p>${uploaded.shareUrl || uploaded.file?.shareUrl || ''}</p>
        </div>
        <button type="button" data-link="${uploaded.shareUrl || uploaded.file?.shareUrl || ''}">Copy</button>
      `;
      resultArea.appendChild(linkCard);
      showToast(`Uploaded ${file.name}.`, 'success');

      linkCard.querySelector('button').addEventListener('click', async () => {
        const url = linkCard.querySelector('button').dataset.link;
        await navigator.clipboard.writeText(url);
        showToast('Share link copied.', 'success');
      });
    } catch (error) {
      card.querySelector('.upload-status').textContent = 'Failed';
      card.querySelector('.upload-progress span').style.width = '0%';
      showToast(error.message || 'Upload failed.', 'error');
    }
  }
}

function handleFiles(files) {
  if (!files?.length) return;
  uploadFiles(files);
}

fileInput?.addEventListener('change', (event) => {
  handleFiles(event.target.files);
  event.target.value = '';
});

dropZone?.addEventListener('dragover', (event) => {
  event.preventDefault();
  dropZone.classList.add('drag-over');
});

dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone?.addEventListener('drop', (event) => {
  event.preventDefault();
  dropZone.classList.remove('drag-over');
  handleFiles(event.dataTransfer?.files || []);
});

dropZone?.addEventListener('click', () => fileInput?.click());
