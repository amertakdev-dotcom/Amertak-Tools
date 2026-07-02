const { saveShare } = require('./_lib/cloud-share');

function readBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      resolve(req.body);
      return;
    }

    if (req.body && typeof req.body === 'string') {
      try {
        resolve(JSON.parse(req.body));
      } catch (error) {
        resolve(req.body);
      }
      return;
    }

    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch (error) {
        resolve(data);
      }
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
    const files = Array.isArray(payload.files) ? payload.files : [payload];

    if (!files.length) {
      res.status(400).json({ success: false, message: 'No files were provided.' });
      return;
    }

    const uploadedFiles = [];
    for (const item of files) {
      const share = await saveShare(req, {
        fileName: item.fileName || item.name || 'shared-file',
        name: item.fileName || item.name || 'shared-file',
        description: item.description || '',
        size: item.size || item.fileSize || 0,
        mimeType: item.mimeType || item.fileType || item.type || 'application/octet-stream',
        fileData: item.fileData || item.data || item.base64,
        category: item.category || ''
      });
      uploadedFiles.push(share);
    }

    res.status(200).json({ success: true, count: uploadedFiles.length, files: uploadedFiles });
  } catch (error) {
    console.error('Upload error:', error);
    const status = error.message?.includes('size') || error.message?.includes('type') ? 400 : 500;
    res.status(status).json({ success: false, message: error.message || 'Upload failed.' });
  }
};
