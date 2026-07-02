const { saveShare, extractBase64Payload } = require('../_lib/cloud-share');

function bufferToBase64(buffer) {
  return buffer.toString('base64');
}

// Vercel serverless function handler
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
    let fileBuffer = null;
    let fileName = 'shared-file';
    let description = 'Shared via Amertak Cloud Share';
    let size = 0;
    let mimeType = 'application/octet-stream';

    // Check content type
    const contentType = req.headers['content-type'] || '';
    
    if (contentType.includes('multipart/form-data')) {
      // For Vercel, we need to parse multipart manually or use a different approach
      // Since formidable doesn't work well with Vercel, we'll parse the body
      // The client should send base64 in JSON format for Vercel compatibility
      const body = await getRequestBody(req);
      const payload = typeof body === 'string' ? JSON.parse(body) : body;
      
      const fileData = payload.fileData || payload.image || payload.data || payload.base64;
      
      if (!fileData) {
        res.status(400).json({ success: false, message: 'No file data was provided.' });
        return;
      }

      const parsed = extractBase64Payload(fileData);
      if (parsed && parsed.data) {
        fileBuffer = Buffer.from(parsed.data, 'base64');
        mimeType = parsed.mimeType || mimeType;
      }

      fileName = payload.fileName || payload.name || fileName;
      description = payload.description || description;
      size = Number(payload.size || payload.imageSize || fileBuffer?.length || 0);
    } else {
      // Handle JSON payload
      const body = await getRequestBody(req);
      const payload = typeof body === 'string' ? JSON.parse(body) : body || {};
      const fileData = payload.fileData || payload.image || payload.data || payload.base64;

      if (!fileData) {
        res.status(400).json({ success: false, message: 'No file data was provided.' });
        return;
      }

      const parsed = extractBase64Payload(fileData);
      if (parsed && parsed.data) {
        fileBuffer = Buffer.from(parsed.data, 'base64');
        mimeType = parsed.mimeType || mimeType;
      }

      fileName = payload.fileName || payload.name || fileName;
      description = payload.description || description;
      size = Number(payload.size || payload.imageSize || fileBuffer?.length || 0);
    }

    if (!fileBuffer) {
      res.status(400).json({ success: false, message: 'No file data was provided.' });
      return;
    }

    const base64Data = bufferToBase64(fileBuffer);

    const result = await saveShare(req, {
      fileName,
      name: fileName,
      description,
      size: size || fileBuffer.length,
      mimeType,
      fileData: base64Data,
      category: ''
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Cloud share error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to upload file.' });
  }
};

// Helper to read request body
async function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}
