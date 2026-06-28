const express = require('express');
const { requireUser } = require('../_lib/require-user');

const router = express.Router();

router.post('/', async (req, res) => {
  const user = await requireUser(req, res);
  if (!user) return;

  const text = String(req.body?.text || '').trim();
  const source = String(req.body?.source || 'auto');
  const target = String(req.body?.target || 'en');

  if (!text) {
    res.status(400).json({ message: 'Text is required.' });
    return;
  }

  try {
    const params = new URLSearchParams({
      client: 'gtx',
      sl: source,
      tl: target,
      dt: 't',
      q: text
    });
    const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`);
    const payload = await response.json();
    const translatedText = Array.isArray(payload?.[0])
      ? payload[0].map((segment) => segment[0]).join('')
      : '';

    if (!response.ok || !translatedText) {
      res.status(502).json({ message: 'Translation service failed.' });
      return;
    }

    res.status(200).json({ success: true, translatedText });
  } catch (error) {
    console.error('Translator API error:', error);
    res.status(502).json({ message: 'Unable to connect to translation service.' });
  }
});

module.exports = router;
