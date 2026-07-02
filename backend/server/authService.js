const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../api/_lib/db');

const JWT_SECRET = process.env.JWT_SECRET || 'please-change-this-secret';
const JWT_EXPIRATION = '7d';
const COOKIE_NAME = 'amertak_token';
const memoryUsers = [];

async function getUserStore() {
  try {
    const db = await getDb();
    return { mode: 'mongodb', users: db.collection('users') };
  } catch (error) {
    console.warn('MongoDB unavailable, using in-memory auth fallback:', error.message);
    return { mode: 'memory', users: memoryUsers };
  }
}

function createToken(user) {
  const id = user.id || (user._id ? user._id.toString() : null);
  return jwt.sign(
    {
      userId: id,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION }
  );
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

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

function buildAuthCookie(token, maxAge = 7 * 24 * 60 * 60) {
  const isProduction = process.env.NODE_ENV === 'production';
  const secure = isProduction;
  const sameSite = isProduction ? 'None' : 'Lax';

  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; Max-Age=${maxAge}; SameSite=${sameSite}${secure ? '; Secure' : ''}`;
}

function clearAuthCookie() {
  const isProduction = process.env.NODE_ENV === 'production';
  const secure = isProduction;
  const sameSite = isProduction ? 'None' : 'Lax';

  return `${COOKIE_NAME}=; Path=/; HttpOnly; Max-Age=0; SameSite=${sameSite}${secure ? '; Secure' : ''}`;
}

async function registerUser({ name, email, password }) {
  if (!name || !email || !password) {
    throw new Error('Name, email, and password are required.');
  }

  const { mode, users } = await getUserStore();
  const normalizedEmail = email.trim().toLowerCase();

  if (mode === 'memory') {
    const existingUser = memoryUsers.find((user) => user.email === normalizedEmail);
    if (existingUser) {
      const error = new Error('A user with this email already exists.');
      error.code = 'USER_EXISTS';
      throw error;
    }

    const passwordHash = await bcrypt.hash(password.trim(), 10);
    const newUser = {
      id: `memory-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      createdAt: new Date()
    };
    memoryUsers.push(newUser);

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    };
  }

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

  const { mode, users } = await getUserStore();
  const normalizedEmail = email.trim().toLowerCase();
  const user = mode === 'memory'
    ? memoryUsers.find((entry) => entry.email === normalizedEmail)
    : await users.findOne({ email: normalizedEmail });

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
      id: user.id || user._id?.toString?.() || null,
      name: user.name,
      email: user.email
    }
  };
}

async function getUserFromRequest(req) {
  const tokenPayload = verifyTokenFromRequest(req);
  if (!tokenPayload?.userId) {
    return null;
  }

  const { mode, users } = await getUserStore();
  if (mode === 'memory') {
    const user = memoryUsers.find((entry) => entry.id === tokenPayload.userId);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email
    };
  }

  const ObjectId = require('mongodb').ObjectId;
  const user = await users.findOne({ _id: new ObjectId(tokenPayload.userId) });
  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email
  };
}

module.exports = {
  createToken,
  buildAuthCookie,
  clearAuthCookie,
  registerUser,
  loginUser,
  getUserFromRequest,
  verifyTokenFromRequest
};
