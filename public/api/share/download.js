const { getShareFileById, incrementDownload } = require('../_lib/cloud-share');

function getQueryValue(req, key) {
  if (req.query && req.query[key]) {
    return req.query[key];
  }

  const url = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);
  return url.searchParams.get(key);
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

    await incrementDownload(shareId);
    const buffer = Buffer.from(file.fileData || '', 'base64');
    res.setHeader('Content-Type', file.mimeType || file.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.fileName || file.name || 'download')}"`);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(buffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, message: error.message || 'Download failed.' });
  }
};