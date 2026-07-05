// Gemini API Proxy - SECURE backend-only endpoint
// ចំណុចបញ្ចប់ API Gemini សុវត្ថិភាព (តែ Backend ប៉ុណ្ណោះ)
// 🔒 API key is NEVER exposed to frontend

module.exports = async function handler(req, res) {
  // Read environment variable inside handler function
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Handle GET requests - return configuration status only
  // NEVER expose the API key
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      configured: !!GEMINI_API_KEY,
      model: 'gemini-2.0-flash-exp',
      features: {
        chat: !!GEMINI_API_KEY,
        coding: !!GEMINI_API_KEY,
        translation: !!GEMINI_API_KEY
      },
      message: GEMINI_API_KEY
        ? 'Gemini API configured'
        : 'Gemini API key not configured'
    });
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      message: 'Method not allowed. Use GET or POST.'
    });
    return;
  }

  try {
    // Read request body
    const body = await readBody(req);
    const { action = 'generate', messages, model, temperature, maxOutputTokens } = body || {};

    // Validate API key exists on server
    if (!GEMINI_API_KEY) {
      res.status(500).json({
        success: false,
        message: 'Gemini API key not configured on server',
        configured: false
      });
      return;
    }

    if (action === 'generate' || action === 'chat') {
      // Proxy request to Gemini API
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({
          success: false,
          message: 'Messages array is required'
        });
        return;
      }

      try {
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-2.0-flash-exp'}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: messages,
              generationConfig: {
                temperature: temperature || 0.7,
                maxOutputTokens: maxOutputTokens || 2000
              }
            })
          }
        );

        const data = await geminiResponse.json();

        if (!geminiResponse.ok) {
          res.status(geminiResponse.status).json({
            success: false,
            message: data.error?.message || 'Gemini API request failed',
            error: data.error
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: data
        });
      } catch (error) {
        console.error('Gemini proxy error:', error);
        res.status(500).json({
          success: false,
          message: 'Failed to connect to Gemini API',
          error: error.message
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid action. Use: generate'
      });
    }

  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

// Helper function to read request body
function readBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body && typeof req.body === 'object') {
      resolve(req.body);
      return;
    }

    if (req.body && typeof req.body === 'string') {
      try {
        resolve(JSON.parse(req.body));
      } catch (error) {
        resolve(req.body);
      }
      return;
    }

    let data = '';
    req.on('data', (chunk) => {
      data += chunk;
    });
    req.on('end', () => {
      if (!data) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(data));
      } catch (error) {
        resolve(data);
      }
    });
    req.on('error', reject);
  });
}