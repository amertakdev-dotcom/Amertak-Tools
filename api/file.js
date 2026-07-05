const { getShareById, deleteShare } = require('./_lib/cloud-share');

function getQueryValue(req, key) {
  if (req.query && req.query[key]) {
    return req.query[key];
  }

  const url = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);
  return url.searchParams.get(key);
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    const id = getQueryValue(req, 'id');

    if (!id) {
      res.status(400).json({ success: false, message: 'Missing file id.' });
      return;
    }

    if (req.method === 'DELETE') {
      const deleted = await deleteShare(id);
      res.status(200).json({ success: true, deleted });
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({ success: false, message: 'Method not allowed' });
      return;
    }

    const file = await getShareById(id);
    if (!file) {
      res.status(404).json({ success: false, message: 'File not found or expired.' });
      return;
    }

    res.status(200).json({ success: true, file });
  } catch (error) {
    console.error('File lookup error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch file.' });
  }
};
