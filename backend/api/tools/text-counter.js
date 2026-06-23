const { requireUser } = require('../_lib/require-user');

function countText(text) {
  const trimmed = text.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean).length : 0;
  const chars = text.length;
  const sentences = trimmed ? (trimmed.match(/[^.!?។៕]+[.!?។៕]+|[^.!?។៕]+$/g) || []).filter((part) => part.trim()).length : 0;
  const paragraphs = trimmed ? trimmed.split(/\n\s*\n/).filter((part) => part.trim()).length : 0;
  const lines = text ? text.split(/\n/).length : 0;
  const readingMinutes = words ? Math.max(1, Math.ceil(words / 220)) : 0;

  return { words, chars, sentences, paragraphs, lines, readingMinutes };
}

module.exports = async function textCounterHandler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const user = await requireUser(req, res);
  if (!user) return;

  const text = String(req.body?.text || '');
  res.status(200).json({ success: true, counts: countText(text) });
};
