const { loginUser, createToken, buildAuthCookie } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const { email, password } = req.body;
    const { user } = await loginUser({ email, password });
    const token = createToken(user);
    res.setHeader('Set-Cookie', buildAuthCookie(token));
    res.status(200).json({ user, token });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Unable to login.' });
  }
};
