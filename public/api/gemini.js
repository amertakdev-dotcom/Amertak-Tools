// Gemini API Configuration Endpoint
// ចំណុចបញ្ចប់ការកំណត់រចនាសម្ព័ន្ធ Gemini API

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

  // Handle GET requests - return configuration status
  if (req.method === 'GET') {
    res.status(200).json({
      success: true,
      configured: GEMINI_API_KEY ? true : false,
      hasKey: !!GEMINI_API_KEY,
      model: 'gemini-2.0-flash-exp',
      features: {
        chat: GEMINI_API_KEY ? true : false,
        coding: GEMINI_API_KEY ? true : false,
        translation: GEMINI_API_KEY ? true : false
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
    const { apiKey, action = 'validate' } = body || {};

    // Handle different actions
    switch (action) {
      case 'validate':
        // Validate the provided API key
        if (!apiKey || apiKey.trim() === '') {
          res.status(400).json({ 
            success: false, 
            message: 'API key is required',
            configured: GEMINI_API_KEY ? true : false
          });
          return;
        }

        // Test the API key with a simple request to Gemini
        const isValid = await validateGeminiApiKey(apiKey);
        
        res.status(200).json({
          success: true,
          valid: isValid,
          message: isValid 
            ? 'Gemini API key is valid and working!' 
            : 'Invalid API key. Please check your key at https://aistudio.google.com/app/apikey',
          configured: GEMINI_API_KEY ? true : false
        });
        break;

      case 'status':
        // Return current configuration status
        res.status(200).json({
          success: true,
          configured: GEMINI_API_KEY ? true : false,
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
        break;

      case 'config':
        // Return configuration (without exposing the actual key)
        res.status(200).json({
          success: true,
          configured: GEMINI_API_KEY ? true : false,
          model: 'gemini-2.0-flash-exp',
          baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
          features: {
            chat: GEMINI_API_KEY ? true : false,
            coding: GEMINI_API_KEY ? true : false,
            translation: GEMINI_API_KEY ? true : false
          }
        });
        break;

      default:
        res.status(400).json({
          success: false,
          message: 'Invalid action. Use: validate, status, or config'
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

// Helper function to validate Gemini API key
async function validateGeminiApiKey(apiKey) {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
}