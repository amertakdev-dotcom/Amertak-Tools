const {
  loginUser,
  createToken,
  buildAuthCookie
} = require('../_lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({
      message: 'Method not allowed'
    });
  }

  try {
    const { email, password } = req.body || {};

    const { user } = await loginUser({
      email,
      password
    });

    const token = createToken(user);

    res.setHeader(
      'Set-Cookie',
      buildAuthCookie(token)
    );

    return res.status(200).json({
      success: true,
      user,
      token
    });
  } catch (error) {
    console.error('LOGIN ERROR:', error);

    return res.status(400).json({
      success: false,
      message:
        error.message || 'Unable to login.'
    });
  }
};
