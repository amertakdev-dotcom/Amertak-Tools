const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

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

    if (!GROQ_API_KEY) {
      return res.status(500).json({ ok: false, error: 'Missing GROQ_API_KEY on server' });
    }

    let groqResponse;
    try {
      groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      });
    } catch (fetchErr) {
      return res.status(502).json({
        ok: false,
        error: 'Failed to reach Groq API: ' + (fetchErr.message || 'Network error')
      });
    }

    const rawText = await groqResponse.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return res.status(502).json({
        ok: false,
        error: 'Groq returned invalid JSON',
        raw: rawText.slice(0, 300)
      });
    }

    if (!groqResponse.ok) {
      return res.status(groqResponse.status).json({
        ok: false,
        error: data?.error?.message || 'Groq API error'
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ ok: false, error: 'Empty reply from Groq' });
    }

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
