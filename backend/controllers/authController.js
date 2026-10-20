import User from '../models/User.js';
import { issueToken, cookieOptions } from '../utils/auth.js';

export async function register(req, res) {
  const { name, email, password, role = 'admin' } = req.body;
  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(409).json({ message: 'An account with this email already exists' });
  const user = await User.create({ name, email, password, role });
  res.status(201).cookie('token', issueToken(user), cookieOptions()).json({
    user: { id: user._id, name: user.name, email: user.email, role: user.role }
  });
}

export async function login(req, res) {
  const user = await User.findOne({ email: req.body.email }).select('+password');
  if (!user || !(await user.comparePassword(req.body.password))) return res.status(401).json({ message: 'Invalid email or password' });
  if (req.body.role && user.role !== req.body.role) return res.status(403).json({ message: `This account is not registered as ${req.body.role === 'teacher' ? 'Faculty' : 'Admin'}` });
  res.cookie('token', issueToken(user), cookieOptions()).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

export function logout(req, res) {
  const secure = process.env.COOKIE_SECURE === 'true';
  res.clearCookie('token', { httpOnly: true, sameSite: secure ? 'none' : 'lax', secure }).json({ message: 'Logged out successfully' });
}

export function me(req, res) {
  res.json({ user: req.user });
}
