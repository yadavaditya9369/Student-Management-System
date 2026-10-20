import { useEffect, useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LockKeyhole, Mail, UserRound, GraduationCap, ArrowRight, Github } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Login({ mode = 'login', portal = false }) {
  const isSignup = mode === 'signup';
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [busy, setBusy] = useState(false);
  const [oauthProviders, setOauthProviders] = useState({});
  useEffect(() => {
    api.get('/auth/oauth/providers').then(({ data }) => setOauthProviders(data.providers || {})).catch(() => setOauthProviders({}));
    if (new URLSearchParams(window.location.search).has('oauth_error')) {
      toast.error('Social sign-in failed or was cancelled. Check provider settings and try again.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
  const oauthHref = (provider) => `${api.defaults.baseURL}/auth/oauth/${provider}`;
  const oauthButton = (provider, label, icon) => oauthProviders[provider]
    ? <a href={oauthHref(provider)} key={provider} className="oauth-provider">{icon}<span>{label}</span></a>
    : <button type="button" key={provider} className="oauth-provider" disabled title={`${label} sign-in is not configured on the server`}>{icon}<span>{label}</span></button>;
  if (user) return <Navigate to="/dashboard" replace />;
  const update = (key) => (event) => setForm({ ...form, [key]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    if (isSignup && form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setBusy(true);
    try {
      if (isSignup) { await register({ name: form.name, email: form.email, password: form.password }); toast.success('Account created! Welcome to EduTrack.'); }
      else { await login({ email: form.email, password: form.password }); toast.success('Welcome back!'); }
      navigate('/dashboard');
    } catch (error) { toast.error(error.response?.data?.message || `Unable to ${isSignup ? 'create account' : 'sign in'}`); } finally { setBusy(false); }
  };
  return <div className={`login-page ${portal ? 'portal-auth-page' : ''}`}>
    {!portal && <div className="login-decoration"><Link to="/" className="auth-brand"><span className="brand-mark"><GraduationCap size={20} /></span> Edu<span>Track</span></Link><div className="login-orb orb-one" /><div className="login-orb orb-two" /><div className="login-quote"><GraduationCap size={40} /><h1>Empower every<br /><span>student journey.</span></h1><p>One clear view of your institution. Manage, measure and make a difference.</p><div className="login-checks"><span><span>✓</span> Simple, focused workflows</span><span><span>✓</span> Insights for better decisions</span></div></div></div>}
    <div className="login-panel"><div className="login-form-wrap">
      {portal ? <Link to="/" className="portal-card-mark"><GraduationCap size={34} /></Link> : <Link to="/" className="mobile-brand"><GraduationCap /> Edu<span>Track</span></Link>}
      {!isSignup && <div className="auth-tabs"><Link className="active" to="/login">Sign in</Link><Link to="/signup">Create account</Link></div>}
      {portal ? <><h2 className="portal-card-title"><strong>{isSignup ? 'CREATE ACCOUNT' : 'STUDENT'}</strong>{!isSignup && ' PORTAL'}</h2><p className="muted portal-card-subtitle">{isSignup ? 'Join your school community' : 'Sign in to access your learning workspace.'}</p></> : <><div className="eyebrow">{isSignup ? 'GET STARTED' : 'WELCOME BACK'}</div><h2>{isSignup ? 'Create your workspace' : 'Welcome back'}</h2><p className="muted">{isSignup ? 'Set up your account and bring your institution into focus.' : 'Sign in to continue to your dashboard.'}</p></>}
      <form onSubmit={submit}>
        {isSignup && <label>Full name<div className="input-wrap"><UserRound size={18} /><input type="text" required value={form.name} onChange={update('name')} placeholder="Your name" /></div></label>}
        <label>Email address<div className="input-wrap"><Mail size={18} /><input type="email" required value={form.email} onChange={update('email')} placeholder="admin@school.edu" /></div></label>
        <label>Password<div className="input-wrap"><LockKeyhole size={18} /><input type={show ? 'text' : 'password'} required minLength="8" value={form.password} onChange={update('password')} placeholder="At least 8 characters" /><button type="button" className="input-action" onClick={() => setShow(!show)}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
        {isSignup && <label>Confirm password<div className="input-wrap"><LockKeyhole size={18} /><input type={show ? 'text' : 'password'} required minLength="8" value={form.confirmPassword} onChange={update('confirmPassword')} placeholder="Repeat your password" /></div></label>}
        {!isSignup && <div className="form-row"><label className="checkbox"><input type="checkbox" /> Remember me</label><a href="#forgot">Forgot password?</a></div>}
        <button className="primary-button full" disabled={busy}>{busy ? 'Please wait...' : isSignup ? 'Create account' : portal ? 'Log in' : 'Sign in to dashboard'} {!portal && <ArrowRight size={16} />}</button>
      </form>
      <div className="oauth-options"><div className="oauth-divider"><span>OR CONTINUE WITH</span></div><div className="oauth-buttons">
        {oauthButton('github', 'GitHub', <Github size={17} />)}
        {oauthButton('microsoft', 'Microsoft', <svg viewBox="0 0 16 16" aria-hidden="true"><path fill="#f25022" d="M1 1h6.5v6.5H1z"/><path fill="#7fba00" d="M8.5 1H15v6.5H8.5z"/><path fill="#00a4ef" d="M1 8.5h6.5V15H1z"/><path fill="#ffb900" d="M8.5 8.5H15V15H8.5z"/></svg>)}
        {oauthButton('google', 'Google', <svg viewBox="0 0 48 48" aria-hidden="true"><path fill="#4285F4" d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11a9.4 9.4 0 0 1-4.1 6.2v5.1h6.7c3.9-3.6 6-8.8 6-15z"/><path fill="#34A853" d="M24 44c5.5 0 10.1-1.8 13.5-4.9l-6.7-5.1c-1.8 1.2-4 2-6.8 2-5.2 0-9.6-3.5-11.2-8.2H5.9v5.2A20 20 0 0 0 24 44z"/><path fill="#FBBC05" d="M12.8 27.8a12 12 0 0 1 0-7.6V15H5.9a20 20 0 0 0 0 18z"/><path fill="#EA4335" d="M24 12c3 0 5.6 1 7.7 3l5.8-5.8C34 5.8 29.5 4 24 4A20 20 0 0 0 5.9 15l6.9 5.2C14.4 15.5 18.8 12 24 12z"/></svg>)}
      </div></div>
      <p className="login-footer">{isSignup ? 'Already have an account? ' : portal ? 'Don’t have an account? ' : 'New to EduTrack? '}<Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Sign in' : portal ? 'Register' : 'Create an account'}</Link></p>
    </div></div>
  </div>;
}
