const { getShareFileById, incrementDownload, cleanupExpired } = require('./_lib/cloud-share');

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

  try {
    await cleanupExpired();
    const id = getQueryValue(req, 'id');
    if (!id) {
      res.status(400).json({ success: false, message: 'Missing file id.' });
      return;
    }

    const file = await getShareFileById(id);
    if (!file) {
      res.status(404).json({ success: false, message: 'File not found or expired.' });
      return;
    }

    await incrementDownload(id);
    const buffer = Buffer.from(file.data || '', 'base64');
    res.setHeader('Content-Type', file.fileType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.fileName || 'download')}"`);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(buffer);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, message: error.message || 'Download failed.' });
  }
};
