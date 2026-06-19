const {
  registerUser,
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
    const {
      name,
      email,
      password
    } = req.body || {};

    const { user } =
      await registerUser({
        name,
        email,
        password
      });

    const token = createToken(user);

    res.setHeader(
      'Set-Cookie',
      buildAuthCookie(token)
    );

    return res.status(201).json({
      success: true,
      user,
      token
    });
  } catch (error) {
    console.error(
      'REGISTER ERROR:',
      error
    );

    if (error.code === 'USER_EXISTS') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }

    return res.status(400).json({
      success: false,
      message:
        error.message ||
        'Unable to register user.'
    });
  }
};
