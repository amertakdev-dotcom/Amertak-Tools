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

function createFileInfoCard(uploadedFile, rawFile) {
  const card = document.createElement('div');
  card.className = 'share-card';
  card.dataset.fileId = uploadedFile.id;
  card.innerHTML = `
    <div class="file-info">
      <strong>${uploadedFile.fileName || rawFile.name}</strong>
      <p class="file-meta">Size: ${formatBytes(uploadedFile.size || rawFile.size)}</p>
      <p class="file-meta">Type: ${uploadedFile.mimeType || rawFile.type || 'Unknown'}</p>
      <p class="file-meta">Uploaded: ${new Date(uploadedFile.createdAt || Date.now()).toLocaleString()}</p>
    </div>
    <div class="file-actions">
      <button type="button" class="btn-generate-link">Generate Share Link</button>
    </div>
  `;
  return card;
}

function createShareLinkCard(shareUrl, shareId, fileName) {
  const card = document.createElement('div');
  card.className = 'share-card share-link-card';
  card.innerHTML = `
    <div class="file-info">
      <strong>${fileName}</strong>
      <p class="file-meta">Share Link Ready</p>
      <div class="share-url-box">
        <input type="text" class="share-url-input" value="${shareUrl}" readonly>
      </div>
    </div>
    <div class="file-actions">
      <button type="button" class="btn-copy-link" data-link="${shareUrl}">Copy Link</button>
      <button type="button" class="btn-open-link" data-link="${shareUrl}">Open Link</button>
      <button type="button" class="btn-delete-file" data-id="${shareId}">Delete</button>
    </div>
  `;
  return card;
}

async function uploadFiles(files) {
  if (!files.length) return;

  const pending = Array.from(files);

  uploadList.innerHTML = '';
  resultArea.innerHTML = '';
  resultArea.className = 'result-area';

  for (const file of pending) {
    if (file.size > MAX_FILE_SIZE) {
      showToast(`${file.name} exceeds 100MB limit.`, 'error');
      continue;
    }

    const card = createUploadCard(file, 0, 'Preparing');
    uploadList.appendChild(card);

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

      const uploadedFile = data.files?.[0] || data;
      card.querySelector('.upload-status').textContent = 'Done';
      card.querySelector('.upload-progress span').style.width = '100%';

      // Show file info card with Generate Share Link button
      const fileInfoCard = createFileInfoCard(uploadedFile, file);
      resultArea.appendChild(fileInfoCard);
      showToast(`Uploaded ${file.name}.`, 'success');

      // Generate Share Link button handler
      fileInfoCard.querySelector('.btn-generate-link').addEventListener('click', async () => {
        const btn = fileInfoCard.querySelector('.btn-generate-link');
        btn.disabled = true;
        btn.textContent = 'Generating...';

        try {
          const genResponse = await fetch('/api/share/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileId: uploadedFile.id
            })
          });

          const genData = await genResponse.json();
          if (!genResponse.ok) {
            throw new Error(genData.message || 'Failed to generate share link.');
          }

          const shareUrl = genData.shareUrl;
          const shareId = genData.shareId;

          // Replace file info card with share link card
          const shareLinkCard = createShareLinkCard(shareUrl, shareId, file.name);
          fileInfoCard.replaceWith(shareLinkCard);

          // Copy Link button handler
          shareLinkCard.querySelector('.btn-copy-link').addEventListener('click', async () => {
            await navigator.clipboard.writeText(shareUrl);
            showToast('Share link copied to clipboard.', 'success');
          });

          // Open Link button handler
          shareLinkCard.querySelector('.btn-open-link').addEventListener('click', () => {
            window.open(shareUrl, '_blank');
          });

          // Delete button handler
          shareLinkCard.querySelector('.btn-delete-file').addEventListener('click', async () => {
            try {
              const delResponse = await fetch(`/api/file?id=${encodeURIComponent(shareId)}`, {
                method: 'DELETE'
              });
              if (delResponse.ok) {
                shareLinkCard.remove();
                showToast('File deleted successfully.', 'success');
              } else {
                showToast('Failed to delete file.', 'error');
              }
            } catch (err) {
              showToast('Failed to delete file.', 'error');
            }
          });

          showToast('Share link generated successfully.', 'success');
        } catch (error) {
          btn.disabled = false;
          btn.textContent = 'Generate Share Link';
          showToast(error.message || 'Failed to generate share link.', 'error');
        }
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