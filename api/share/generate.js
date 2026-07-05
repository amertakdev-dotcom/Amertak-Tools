const { generateShare } = require('../_lib/cloud-share');

function readBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      resolve(req.body);
      return;
    }
    if (req.body && typeof req.body === 'string') {
      try { resolve(JSON.parse(req.body)); }
      catch { resolve(req.body); }
      return;
    }
    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      if (!data) { resolve({}); return; }
      try { resolve(JSON.parse(data)); }
      catch { resolve(data); }
    });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  try {
    const body = await readBody(req);
    const payload = typeof body === 'string' ? { fileData: body } : body || {};

    const fileId = payload.fileId || payload.id || '';
    if (!fileId) {
      res.status(400).json({ success: false, message: 'Missing file ID. Provide the file ID from a previous upload.' });
      return;
    }

    const share = await generateShare(req, fileId);

    res.status(200).json({
      success: true,
      shareId: share.shareId,
      shareUrl: share.shareUrl,
      file: share.file
    });
  } catch (error) {
    console.error('Share generation error:', error);
    const status = error.message?.includes('size') || error.message?.includes('type') || error.message?.includes('not found') ? 400 : 500;
    res.status(status).json({ success: false, message: error.message || 'Failed to generate share link.' });
  }
};