const { requireUser } = require('../_lib/require-user');

function normalizeHex(value) {
  let hex = String(value || '').trim().replace(/^#/, '');
  if (hex.length === 3) hex = hex.split('').map((char) => char + char).join('');
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) return null;
  return `#${hex.toLowerCase()}`;
}

function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

function rgbToHsl({ r, g, b }) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    if (max === g) h = (b - r) / d + 2;
    if (max === b) h = (r - g) / d + 4;
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function rgbToHsv({ r, g, b }) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    if (max === g) h = (b - r) / d + 2;
    if (max === b) h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return { h, s: Math.round((max === 0 ? 0 : d / max) * 100), v: Math.round(max * 100) };
}

module.exports = async function colorConverterHandler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const user = await requireUser(req, res);
  if (!user) return;

  const hex = normalizeHex(req.body?.hex);
  if (!hex) {
    res.status(400).json({ message: 'Invalid HEX color.' });
    return;
  }

  const rgb = hexToRgb(hex);
  res.status(200).json({ success: true, hex, rgb, hsl: rgbToHsl(rgb), hsv: rgbToHsv(rgb) });
};
