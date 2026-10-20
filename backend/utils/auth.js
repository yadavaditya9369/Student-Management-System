import jwt from 'jsonwebtoken';

export function issueToken(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role, name: user.name, email: user.email }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });
}

export function cookieOptions() {
  const secure = process.env.COOKIE_SECURE === 'true';
  // Vercel and onrender.com are cross-site, so browsers require SameSite=None
  // for credentialed frontend API requests to include the auth cookie.
  return { httpOnly: true, sameSite: secure ? 'none' : 'lax', secure, maxAge: 8 * 60 * 60 * 1000 };
}

