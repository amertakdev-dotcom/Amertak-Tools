const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { getDb } = require('../api/_lib/db');

const JWT_SECRET = process.env.JWT_SECRET || 'please-change-this-secret';
const JWT_EXPIRATION = '7d';
const COOKIE_NAME = 'amertak_token';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
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
      provider: 'credentials',
      createdAt: new Date()
    };
    memoryUsers.push(newUser);

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        provider: newUser.provider
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
    provider: 'credentials',
    createdAt: new Date()
  });

  return {
    user: {
      id: result.insertedId.toString(),
      name: name.trim(),
      email: normalizedEmail,
      provider: 'credentials'
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

  // If user registered via Google and has no password, they can't login with password
  if (!user.passwordHash) {
    const error = new Error('This account uses Google login. Please sign in with Google.');
    error.code = 'GOOGLE_ACCOUNT';
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
      email: user.email,
      provider: user.provider || 'credentials'
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
      email: user.email,
      provider: user.provider
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
    email: user.email,
    provider: user.provider
  };
}

async function googleLogin({ credential }) {
  if (!credential) {
    throw new Error('Google credential is required.');
  }

  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google OAuth is not configured. Set GOOGLE_CLIENT_ID in environment variables.');
  }

  // Verify the Google credential token
  const client = new OAuth2Client(GOOGLE_CLIENT_ID);
  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID
    });
    payload = ticket.getPayload();
  } catch (error) {
    throw new Error('Invalid Google credential.');
  }

  if (!payload) {
    throw new Error('Unable to verify Google credential.');
  }

  const { sub: googleId, email, name, picture } = payload;

  if (!email) {
    throw new Error('Google account must have an email address.');
  }

  const normalizedEmail = email.toLowerCase();
  const { mode, users } = await getUserStore();

  // Rule 1: Find user by googleId
  let user = mode === 'memory'
    ? memoryUsers.find((u) => u.googleId === googleId)
    : await users.findOne({ googleId });

  if (user) {
    // User found by googleId → Login
    return {
      user: {
        id: user.id || user._id?.toString?.() || null,
        name: user.name,
        email: user.email,
        provider: user.provider,
        avatar: user.avatar || picture
      },
      isNewUser: false
    };
  }

  // Rule 2: No googleId found, search by email
  user = mode === 'memory'
    ? memoryUsers.find((u) => u.email === normalizedEmail)
    : await users.findOne({ email: normalizedEmail });

  if (user) {
    // Found by email → Link Google account
    if (mode === 'memory') {
      user.googleId = googleId;
      user.provider = 'google';
      if (!user.avatar) {
        user.avatar = picture;
      }
    } else {
      const updateFields = {
        $set: {
          googleId,
          provider: 'google'
        }
      };
      if (!user.avatar && picture) {
        updateFields.$set.avatar = picture;
      }
      await users.updateOne({ _id: user._id }, updateFields);
      user.googleId = googleId;
      user.provider = 'google';
      if (!user.avatar) {
        user.avatar = picture;
      }
    }

    return {
      user: {
        id: user.id || user._id?.toString?.() || null,
        name: user.name,
        email: user.email,
        provider: 'google',
        avatar: user.avatar
      },
      isNewUser: false
    };
  }

  // Rule 3: No user found by googleId or email → Create new user
  const displayName = name || email.split('@')[0];

  if (mode === 'memory') {
    const newUser = {
      id: `memory-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: displayName,
      email: normalizedEmail,
      googleId,
      provider: 'google',
      avatar: picture || null,
      createdAt: new Date()
    };
    memoryUsers.push(newUser);

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        provider: newUser.provider,
        avatar: newUser.avatar
      },
      isNewUser: true
    };
  }

  const result = await users.insertOne({
    name: displayName,
    email: normalizedEmail,
    googleId,
    provider: 'google',
    avatar: picture || null,
    createdAt: new Date()
  });

  return {
    user: {
      id: result.insertedId.toString(),
      name: displayName,
      email: normalizedEmail,
      provider: 'google',
      avatar: picture || null
    },
    isNewUser: true
  };
}

module.exports = {
  createToken,
  buildAuthCookie,
  clearAuthCookie,
  registerUser,
  loginUser,
  getUserFromRequest,
  verifyTokenFromRequest,
  googleLogin
};