const { registerUser, createToken, buildAuthCookie } = require('../_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const { name, email, password } = req.body;
    const { user } = await registerUser({ name, email, password });
    const token = createToken(user);
    res.setHeader('Set-Cookie', buildAuthCookie(token));
    res.status(201).json({ user, token });
  } catch (error) {
    if (error.code === 'USER_EXISTS') {
      res.status(409).json({ message: error.message });
      return;
    }
    res.status(400).json({ message: error.message || 'Unable to register user.' });
  }
};
