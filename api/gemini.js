const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const body = await readBody(req);
    const { message } = (typeof body === 'string' ? JSON.parse(body) : body) || {};

    if (!message) {
      return res.status(400).json({ ok: false, error: 'Message is required' });
    }

    if (!GEMINI_API_KEY) {
      return res.status(500).json({ ok: false, error: 'Missing GEMINI_API_KEY on server' });
    }

    let geminiResponse;
    try {
      // ហៅទៅកាន់ Google Gemini API ដោយប្រើម៉ូដែល gemini-2.0-flash-lite
      geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: message }
              ]
            }
          ]
        })
      });
    } catch (fetchErr) {
      return res.status(502).json({
        ok: false,
        error: 'Failed to reach Gemini API: ' + (fetchErr.message || 'Network error')
      });
    }

    const rawText = await geminiResponse.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return res.status(502).json({
        ok: false,
        error: 'Gemini returned invalid JSON',
        raw: rawText.slice(0, 300)
      });
    }

    if (!geminiResponse.ok) {
      return res.status(geminiResponse.status).json({
        ok: false,
        error: data?.error?.message || 'Gemini API error'
      });
    }

    // ចាប់យកអត្ថបទឆ្លើយតបចេញពី Structure របស់ Gemini API
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return res.status(500).json({ ok: false, error: 'Empty reply from Gemini' });
    }

    // ត្រឡប់ទៅ Frontend វិញតាមទម្រង់ចាស់ { ok: true, reply } ដូច Groq បេះបិទ
    return res.status(200).json({ ok: true, reply });

  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message || 'Server error' });
  }
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      resolve(req.body);
      return;
    }
    if (req.body && typeof req.body === 'string') {
      try { resolve(JSON.parse(req.body)); } catch { resolve(req.body); }
      return;
    }
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      if (!data) { resolve({}); return; }
      try { resolve(JSON.parse(data)); } catch { resolve(data); }
    });
    req.on('error', reject);
  });
}
