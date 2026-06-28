const { requireUser } = require('../_lib/require-user');

function clampNumber(value, min, max, fallback) {
  const parsed = Number(value);
  if (Number.isNaN(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
}

module.exports = async function qrCodeHandler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const user = await requireUser(req, res);
  if (!user) return;

  const text = String(req.body?.text || '').trim();
  if (!text) {
    res.status(400).json({ message: 'Text is required.' });
    return;
  }

  try {
    const size = clampNumber(req.body?.size, 160, 800, 280);
    const margin = clampNumber(req.body?.margin, 0, 8, 2);
    const params = new URLSearchParams({
      data: text,
      size: `${size}x${size}`,
      margin: String(margin),
      format: 'png',
      ecc: 'M',
      color: '05070c',
      bgcolor: 'ffffff',
      'charset-source': 'UTF-8',
      'charset-target': 'UTF-8'
    });
    const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?${params.toString()}`);
    const arrayBuffer = await response.arrayBuffer();

    if (!response.ok) {
      res.status(502).json({ message: 'QR service failed.' });
      return;
    }

    const base64 = Buffer.from(arrayBuffer).toString('base64');
    res.status(200).json({
      success: true,
      dataUrl: `data:image/png;base64,${base64}`
    });
  } catch (error) {
    console.error('QR Code Generator error:', error);
    res.status(502).json({ message: 'Unable to generate QR code.' });
  }
};
