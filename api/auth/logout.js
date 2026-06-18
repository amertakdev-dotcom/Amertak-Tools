const { clearAuthCookie } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  res.setHeader('Set-Cookie', clearAuthCookie());
  res.status(200).json({ message: 'Logged out.' });
};
