const { getShareFileById } = require('../_lib/cloud-share');

function getQueryValue(req, key) {
  if (req.query && req.query[key]) {
    return req.query[key];
  }

  const url = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);
  return url.searchParams.get(key);
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

function generateBannerSVG(file) {
  const fileName = file.fileName || file.name || 'Shared File';
  const truncatedName = fileName.length > 40 ? fileName.substring(0, 37) + '...' : fileName;
  const fileSize = formatBytes(file.size || 0);
  const icon = getFileIcon(file.mimeType);
  const date = new Date(file.createdAt || file.uploadedAt || Date.now()).toLocaleDateString();
  
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#16213e;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#ff0080;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#ff3366;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Background -->
  <rect width="1200" height="630" fill="url(#bg)"/>
  
  <!-- Decorative circles -->
  <circle cx="100" cy="100" r="200" fill="url(#accent)" opacity="0.1"/>
  <circle cx="1100" cy="530" r="250" fill="url(#accent)" opacity="0.08"/>
  
  <!-- Main content box -->
  <rect x="100" y="150" width="1000" height="330" rx="20" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" stroke-width="2"/>
  
  <!-- File icon -->
  <text x="150" y="280" font-size="80">${icon}</text>
  
  <!-- File name -->
  <text x="260" y="240" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#ffffff">
    ${truncatedName.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')}
  </text>
  
  <!-- File info -->
  <text x="260" y="290" font-family="Arial, sans-serif" font-size="20" fill="rgba(255,255,255,0.7)">
    ${fileSize} • ${(file.mimeType || 'application/octet-stream').split('/')[1]?.toUpperCase() || 'FILE'}
  </text>
  
  <text x="260" y="330" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.5)">
    Uploaded: ${date}
  </text>
  
  <!-- Branding -->
  <text x="600" y="480" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="url(#accent)" text-anchor="middle">
    Amertak Tools
  </text>
  
  <text x="600" y="520" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.5)" text-anchor="middle">
    Secure File Sharing
  </text>
  
  <!-- Bottom accent line -->
  <rect x="100" y="560" width="1000" height="4" rx="2" fill="url(#accent)"/>
</svg>`;

  return svg;
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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  const shareId = getQueryValue(req, 'id');
  if (!shareId) {
    res.status(400).json({ success: false, message: 'Missing share ID.' });
    return;
  }

  try {
    const file = await getShareFileById(shareId);
    if (!file) {
      res.status(404).json({ success: false, message: 'File not found or expired.' });
      return;
    }

    const svg = generateBannerSVG({
      fileName: file.fileName || file.name,
      name: file.name,
      size: file.size || file.fileSize || 0,
      mimeType: file.mimeType || file.fileType || 'application/octet-stream',
      createdAt: file.createdAt || file.uploadedAt
    });

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.status(200).send(svg);
  } catch (error) {
    console.error('Banner generation error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to generate banner.' });
  }
};