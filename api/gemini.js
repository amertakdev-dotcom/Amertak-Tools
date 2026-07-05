const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      configured: !!GEMINI_API_KEY,
      hasKey: !!GEMINI_API_KEY,
      model: 'gemini-2.0-flash-exp',
      features: {
        chat: !!GEMINI_API_KEY,
        coding: !!GEMINI_API_KEY,
        translation: !!GEMINI_API_KEY
      },
      message: GEMINI_API_KEY ? 'Gemini API configured' : 'Gemini API key not configured'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed. Use GET or POST.'
    });
  }

  try {
    const body = await readBody(req);
    const { apiKey, action = 'validate', messages, model, temperature, maxOutputTokens } = body || {};

    switch (action) {

      case 'generate': {
        const keyToUse = GEMINI_API_KEY;

        if (!keyToUse) {
          return res.status(500).json({
            success: false,
            message: 'GEMINI_API_KEY is not configured on the server.'
          });
        }

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
          return res.status(400).json({
            success: false,
            message: 'messages array is required for generate action.'
          });
        }

        const targetModel = model || 'gemini-2.0-flash-exp';
        const url = `${GEMINI_BASE_URL}/models/${targetModel}:generateContent?key=${keyToUse}`;

        const geminiBody = {
          contents: messages,
          generationConfig: {
            temperature: typeof temperature === 'number' ? temperature : 0.7,
            maxOutputTokens: typeof maxOutputTokens === 'number' ? maxOutputTokens : 2000
          }
        };

        let geminiResponse;
        try {
          geminiResponse = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiBody)
          });
        } catch (fetchErr) {
          return res.status(502).json({
            success: false,
            message: 'Failed to reach Gemini API: ' + (fetchErr.message || 'Network error')
          });
        }

        const rawText = await geminiResponse.text();

        let data;
        try {
          data = JSON.parse(rawText);
        } catch (parseErr) {
          return res.status(502).json({
            success: false,
            message: 'Gemini API returned invalid JSON.',
            raw: rawText.slice(0, 300)
          });
        }

        if (!geminiResponse.ok) {
          return res.status(geminiResponse.status).json({
            success: false,
            message: data?.error?.message || 'Gemini API error',
            data
          });
        }

        return res.status(200).json({
          success: true,
          data
        });
      }

      case 'validate': {
        if (!apiKey || apiKey.trim() === '') {
          return res.status(400).json({
            success: false,
            message: 'API key is required',
            configured: !!GEMINI_API_KEY
          });
        }

        const isValid = await validateGeminiApiKey(apiKey);
        return res.status(200).json({
          success: true,
          valid: isValid,
          message: isValid
            ? 'Gemini API key is valid and working!'
            : 'Invalid API key. Please check your key at https://aistudio.google.com/app/apikey',
          configured: !!GEMINI_API_KEY
        });
      }

      case 'status': {
        return res.status(200).json({
          success: true,
          configured: !!GEMINI_API_KEY,
          hasKey: !!GEMINI_API_KEY,
          message: GEMINI_API_KEY
            ? 'Gemini API is configured'
            : 'Gemini API key not configured. Please add GEMINI_API_KEY to your Vercel environment variables.',
          setupInstructions: {
            vercel: [
              '1. Go to your Vercel project dashboard',
              '2. Navigate to Settings > Environment Variables',
              '3. Add new variable: GEMINI_API_KEY',
              '4. Paste your API key from https://aistudio.google.com/app/apikey',
              '5. Select Production and Preview environments',
              '6. Redeploy your project'
            ],
            getApiKey: 'https://aistudio.google.com/app/apikey'
          }
        });
      }

      case 'config': {
        return res.status(200).json({
          success: true,
          configured: !!GEMINI_API_KEY,
          model: 'gemini-2.0-flash-exp',
          baseUrl: GEMINI_BASE_URL,
          features: {
            chat: !!GEMINI_API_KEY,
            coding: !!GEMINI_API_KEY,
            translation: !!GEMINI_API_KEY
          }
        });
      }

      default: {
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Use: generate, validate, status, or config'
        });
      }
    }

  } catch (error) {
    console.error('Gemini API handler error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      resolve(req.body);
      return;
    }

    if (req.body && typeof req.body === 'string') {
      try {
        resolve(JSON.parse(req.body));
      } catch {
        resolve(req.body);
      }
      return;
    }

    let data = '';
    req.on('data', (chunk) => { data += chunk; });
    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve(data);
      }
    });
    req.on('error', reject);
  });
}

async function validateGeminiApiKey(apiKey) {
  try {
    const response = await fetch(
      `${GEMINI_BASE_URL}/models?key=${apiKey}`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}
