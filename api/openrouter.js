// ប្តូរទៅប្រើប្រាស់ Environment Variable របស់ OpenRouter
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

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

    if (!OPENROUTER_API_KEY) {
      return res.status(500).json({ ok: false, error: 'Missing OPENROUTER_API_KEY on server' });
    }

    let openrouterResponse;
    try {
      // ប្តូរ Endpoint ទៅកាន់ OpenRouter
      openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          // បន្ថែមដើម្បីឱ្យ OpenRouter ស្គាល់ឈ្មោះ App របស់អ្នក (ដាក់អ្វីក៏បាន)
          'HTTP-Referer': 'https://localhost:3000', 
          'X-Title': 'My AI Project'
        },
        body: JSON.stringify({
          // ប្រើប្រាស់ម៉ូដែល Free ដែលមានល្បឿនលឿន និង High Limit + គាំទ្រ Vision
          model: 'meta-llama/llama-3.2-11b-vision-instruct',
          messages: [
            { role: 'user', content: message } // content នេះអាចទទួលយកបានទាំង Text និង រចនាសម្ព័ន្ធរូបភាព
          ],
          temperature: 0.7,
          max_tokens: 1024
        })
      });
    } catch (fetchErr) {
      return res.status(502).json({
        ok: false,
        error: 'Failed to reach OpenRouter API: ' + (fetchErr.message || 'Network error')
      });
    }

    const rawText = await openrouterResponse.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return res.status(502).json({
        ok: false,
        error: 'OpenRouter returned invalid JSON',
        raw: rawText.slice(0, 300)
      });
    }

    if (!openrouterResponse.ok) {
      return res.status(openrouterResponse.status).json({
        ok: false,
        error: data?.error?.message || 'OpenRouter API error'
      });
    }

    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ ok: false, error: 'Empty reply from OpenRouter' });
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
