import { createPublicKey, randomBytes, verify as verifySignature } from 'node:crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { cookieOptions, issueToken } from '../utils/auth.js';

const providerNames = ['google', 'microsoft', 'github'];
const frontendUrl = () => (process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || 'http://localhost:5173').replace(/\/$/, '');
const apiUrl = () => (process.env.API_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`).replace(/\/$/, '');
const tenant = () => process.env.MICROSOFT_TENANT_ID || 'common';
const callbackUrl = (provider) => `${apiUrl()}/api/auth/oauth/${provider}/callback`;
const settings = {
  google: () => ({ clientId: process.env.GOOGLE_CLIENT_ID, clientSecret: process.env.GOOGLE_CLIENT_SECRET }),
  microsoft: () => ({ clientId: process.env.MICROSOFT_CLIENT_ID, clientSecret: process.env.MICROSOFT_CLIENT_SECRET }),
  github: () => ({ clientId: process.env.GITHUB_CLIENT_ID, clientSecret: process.env.GITHUB_CLIENT_SECRET })
};
const authCookie = { httpOnly: true, sameSite: 'lax', secure: process.env.COOKIE_SECURE === 'true', path: '/api/auth/oauth', maxAge: 10 * 60 * 1000 };

function configFor(provider) {
  const config = settings[provider]?.();
  if (!config?.clientId || !config?.clientSecret) return null;
  return config;
}

export function startOAuth(req, res) {
  const { provider } = req.params;
  const config = configFor(provider);
  if (!config) return res.status(503).json({ message: `${provider} sign-in is not configured on the server.` });
  const state = randomBytes(32).toString('hex');
  const nonce = randomBytes(32).toString('hex');
  const stateToken = jwt.sign({ state, nonce, provider }, process.env.JWT_SECRET, { expiresIn: '10m' });
  res.cookie('oauth_state', stateToken, authCookie);

  const endpoints = {
    google: 'https://accounts.google.com/o/oauth2/v2/auth',
    microsoft: `https://login.microsoftonline.com/${tenant()}/oauth2/v2.0/authorize`,
    github: 'https://github.com/login/oauth/authorize'
  };
  const url = new URL(endpoints[provider]);
  url.searchParams.set('client_id', config.clientId);
  url.searchParams.set('redirect_uri', callbackUrl(provider));
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);
  if (provider === 'google') {
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('nonce', nonce);
  } else if (provider === 'microsoft') {
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('nonce', nonce);
  } else {
    url.searchParams.set('scope', 'read:user user:email');
  }
  return res.redirect(url.toString());
}

async function exchangeCode(provider, code, config) {
  const tokenUrls = {
    google: 'https://oauth2.googleapis.com/token',
    microsoft: `https://login.microsoftonline.com/${tenant()}/oauth2/v2.0/token`,
    github: 'https://github.com/login/oauth/access_token'
  };
  const body = new URLSearchParams({ client_id: config.clientId, client_secret: config.clientSecret, code, redirect_uri: callbackUrl(provider), grant_type: 'authorization_code' });
  const response = await fetch(tokenUrls[provider], { method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' }, body });
  const tokens = await response.json();
  if (!response.ok || tokens.error || !tokens.access_token) throw new Error('The identity provider could not verify the authorization code.');
  return tokens;
}

async function fetchJson(url, token) {
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'User-Agent': 'EduTrack-Student-Management' } });
  if (!response.ok) throw new Error('Could not retrieve the verified profile from the identity provider.');
  return response.json();
}

async function getIdentity(provider, tokens, nonce, clientId) {
  if (provider === 'github') {
    const [profile, emails] = await Promise.all([
      fetchJson('https://api.github.com/user', tokens.access_token),
      fetchJson('https://api.github.com/user/emails', tokens.access_token)
    ]);
    const primary = emails.find((item) => item.primary && item.verified);
    if (!profile.id || !primary?.email) throw new Error('GitHub must provide a verified primary email for account sign-in.');
    return { id: String(profile.id), email: primary.email.toLowerCase(), emailVerified: true, name: profile.name || profile.login };
  }

  if (!tokens.id_token) throw new Error('The identity provider did not return an ID token.');
  const parts = tokens.id_token.split('.');
  if (parts.length !== 3) throw new Error('The identity provider returned a malformed ID token.');
  const header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
  const untrusted = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  if (header.alg !== 'RS256' || !header.kid) throw new Error('The identity token uses an unsupported signing key.');
  let jwksUrl;
  let issuer;
  if (provider === 'google') {
    jwksUrl = 'https://www.googleapis.com/oauth2/v3/certs';
    issuer = ['https://accounts.google.com', 'accounts.google.com'];
  } else {
    if (!/^[0-9a-f-]{36}$/i.test(untrusted.tid || '')) throw new Error('Microsoft returned an invalid tenant identifier.');
    jwksUrl = `https://login.microsoftonline.com/${tenant()}/discovery/v2.0/keys`;
    issuer = `https://login.microsoftonline.com/${untrusted.tid}/v2.0`;
  }
  const jwksResponse = await fetch(jwksUrl);
  if (!jwksResponse.ok) throw new Error('Could not load the provider signing keys.');
  const jwks = await jwksResponse.json();
  const jwk = jwks.keys?.find((item) => item.kid === header.kid && item.use === 'sig');
  if (!jwk) throw new Error('The identity token signing key was not recognized.');
  const publicKey = createPublicKey({ key: jwk, format: 'jwk' });
  const signingInput = Buffer.from(`${parts[0]}.${parts[1]}`);
  if (!verifySignature('RSA-SHA256', signingInput, publicKey, Buffer.from(parts[2], 'base64url'))) throw new Error('The identity token signature is invalid.');
  const expectedIssuers = Array.isArray(issuer) ? issuer : [issuer];
  if (!expectedIssuers.includes(untrusted.iss) || untrusted.aud !== clientId || untrusted.nonce !== nonce || untrusted.email_verified === false || (provider === 'google' && untrusted.email_verified !== true) || !untrusted.exp || untrusted.exp <= Date.now() / 1000) throw new Error('The identity token did not pass issuer, audience, expiry, nonce, or email checks.');
  const email = String(untrusted.email || untrusted.preferred_username || '').toLowerCase();
  if (!email || !untrusted.sub) throw new Error('The provider account is missing an email address.');
  return { id: String(untrusted.sub), email, emailVerified: untrusted.email_verified === true, name: String(untrusted.name || email.split('@')[0]) };
}

async function findOrCreateUser(provider, identity) {
  const providerPath = `oauthProviders.${provider}`;
  let user = await User.findOne({ [providerPath]: identity.id });
  if (user) return user;
  user = await User.findOne({ email: identity.email });
  if (user) {
    if (!identity.emailVerified) throw new Error('Sign in with this email and password first, then link this provider from a verified account.');
    user.set(providerPath, identity.id);
    await user.save();
    return user;
  }
  const randomPassword = randomBytes(48).toString('base64url');
  try {
    return await User.create({ name: identity.name.slice(0, 120), email: identity.email, password: randomPassword, oauthProviders: { [provider]: identity.id } });
  } catch (error) {
    if (error.code !== 11000) throw error;
    user = await User.findOne({ $or: [{ email: identity.email }, { [providerPath]: identity.id }] });
    if (!user) throw error;
    if (!user.get(providerPath)) { user.set(providerPath, identity.id); await user.save(); }
    return user;
  }
}

export async function finishOAuth(req, res) {
  const { provider } = req.params;
  const config = configFor(provider);
  const stateCookie = req.cookies.oauth_state;
  res.clearCookie('oauth_state', { ...authCookie, maxAge: undefined });
  try {
    if (!config) throw new Error(`${provider} sign-in is not configured on the server.`);
    if (!req.query.code || !req.query.state || !stateCookie) throw new Error('The sign-in request was cancelled or expired. Please try again.');
    const statePayload = jwt.verify(stateCookie, process.env.JWT_SECRET);
    if (statePayload.provider !== provider || statePayload.state !== req.query.state) throw new Error('The sign-in state check failed. Please try again.');
    const tokens = await exchangeCode(provider, req.query.code, config);
    const identity = await getIdentity(provider, tokens, statePayload.nonce, config.clientId);
    const user = await findOrCreateUser(provider, identity);
    res.cookie('token', issueToken(user), cookieOptions());
    return res.redirect(`${frontendUrl()}/dashboard`);
  } catch (error) {
    console.error(`OAuth ${provider} callback failed:`, error.message);
    return res.redirect(`${frontendUrl()}/login?oauth_error=1`);
  }
}

export function oauthProviders(req, res) {
  res.json({ providers: Object.fromEntries(providerNames.map((provider) => [provider, Boolean(configFor(provider))])) });
}
