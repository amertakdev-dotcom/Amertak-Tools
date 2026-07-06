// Vercel serverless function to expose public Google Client ID
// This reads from environment variable set in Vercel dashboard
module.exports = (req, res) => {
  const clientId = process.env.PUBLIC_GOOGLE_CLIENT_ID || '';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  res.status(200).json({
    googleClientId: clientId
  });
};