const { getUserFromRequest } = require('./auth');

async function requireUser(req, res) {
  const user = await getUserFromRequest(req);
  if (!user) {
    res.status(401).json({
      message: 'Please login or register to use this tool.',
      loginRequired: true
    });
    return null;
  }

  return user;
}

module.exports = { requireUser };
