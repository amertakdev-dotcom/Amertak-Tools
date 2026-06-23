const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'please-change-this-secret';
const JWT_EXPIRATION = '7d';
const COOKIE_NAME = 'amertak_token';

function createToken(user) {
  return jwt.sign(
    {
      userId: user.id || user._id.toString(),
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
}

function buildAuthCookie(token, maxAge = 7 * 24 * 60 * 60) {
  const secure = process.env.NODE_ENV === 'production';
  const sameSite = 'Lax';
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Max-Age=${maxAge}; SameSite=${sameSite}${secure ? '; Secure' : ''}`;
}

function clearAuthCookie() {
  const secure = process.env.NODE_ENV === 'production';
  const sameSite = 'Lax';
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0; SameSite=${sameSite}${secure ? '; Secure' : ''}`;
}

async function registerUser({ name, email, password }) {
  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required.');
  }

  const db = await getDb();
  const users = db.collection('users');
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await users.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('A user with this email already exists.');
    error.code = 'USER_EXISTS';
    throw error;
  }

  const passwordHash = await bcrypt.hash(password.trim(), 10);
  const result = await users.insertOne({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    createdAt: new Date()
  });

  return {
    user: {
      id: result.insertedId.toString(),
      name: name.trim(),
      email: normalizedEmail
    }
  };
}

async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error('Email and password are required.');
  }

  const db = await getDb();
  const users = db.collection('users');
  const normalizedEmail = email.trim().toLowerCase();
  const user = await users.findOne({ email: normalizedEmail });

  if (!user) {
    const error = new Error('Invalid email or password.');
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    const error = new Error('Invalid email or password.');
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  return {
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email
    }
  };
}

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((cookies, cookie) => {
    const [name, ...valueParts] = cookie.trim().split('=');
    if (!name) return cookies;
    cookies[name] = decodeURIComponent(valueParts.join('='));
    return cookies;
  }, {});
}

function verifyTokenFromRequest(req) {
  const authHeader = req.headers?.authorization;
  const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const cookieHeader = req.headers?.cookie || '';
  const cookies = parseCookies(cookieHeader);
  const token = tokenFromHeader || cookies[COOKIE_NAME];
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

async function getUserFromRequest(req) {
  const tokenPayload = verifyTokenFromRequest(req);
  if (!tokenPayload?.userId) return null;

  const db = await getDb();
  const users = db.collection('users');
  const ObjectId = require('mongodb').ObjectId;
  const user = await users.findOne({ _id: new ObjectId(tokenPayload.userId) });
  if (!user) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email
  };
}

module.exports = {
  buildAuthCookie,
  clearAuthCookie,
  createToken,
  loginUser,
  registerUser,
  getUserFromRequest
};
