export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const { message } = typeof body === 'string' ? JSON.parse(body) : body;

    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Missing API key' });
    }

    let groqResponse;
    try {
      groqResponse = await fetch(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: 'You are a helpful AI assistant.'
              },
              {
                role: 'user',
                content: message
              }
            ],
            temperature: 0.7,
            max_tokens: 1024
          })
        }
      );
    } catch (fetchErr) {
      return res.status(502).json({
        error: 'Failed to reach Groq API: ' + (fetchErr.message || 'Network error')
      });
    }

    const rawText = await groqResponse.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return res.status(502).json({
        error: 'Groq returned invalid JSON',
        raw: rawText.slice(0, 300)
      });
    }

    if (!groqResponse.ok) {
      return res.status(groqResponse.status).json({
        error: data?.error?.message || 'Groq API error'
      });
    }

    const reply = data?.choices?.[0]?.message?.content || 'No response from AI';

    return res.status(200).json({
      reply,
      model: 'llama-3.1-70b-versatile'
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message || 'Server error'
    });
  }
}
