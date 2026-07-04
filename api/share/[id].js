const { getShareById } = require('../_lib/cloud-share');

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

  const shareId = req.query?.id || req.query?.['id'] || '';
  if (!shareId) {
    res.status(400).json({ success: false, message: 'Missing share ID.' });
    return;
  }

  try {
    const file = await getShareById(shareId);
    if (!file) {
      res.status(404).json({ success: false, message: 'File not found.' });
      return;
    }

    res.status(200).json({ success: true, file });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to load file.' });
  }
};
