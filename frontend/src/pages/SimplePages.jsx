import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, LogOut, Monitor, ShieldCheck, SlidersHorizontal, Users, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { readPreferences, savePreferences } from '../utils/preferences';

function PreferenceSwitch({ checked, label, onChange }) {
  return <button className={`settings-switch${checked ? ' is-on' : ''}`} type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}><span /></button>;
}

export function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState(readPreferences);

  const updatePreference = (patch) => {
    try {
      const next = savePreferences(patch);
      setPreferences(next);
      if (Object.hasOwn(patch, 'compactTables')) document.documentElement.dataset.density = next.compactTables ? 'compact' : 'comfortable';
      toast.success('Preference saved');
    } catch {
      toast.error('Could not save this preference in your browser');
    }
  };

  const signOut = async () => {
    try { await logout(); navigate('/login'); }
    catch { toast.error('Could not sign out'); }
  };

  return <div className="settings-page">
    <div className="page-heading"><div><div className="eyebrow">PREFERENCES</div><h1>Settings</h1><p className="muted">Manage your account and tailor the workspace to your routine.</p></div><div className="settings-saved"><span /> Saved on this device</div></div>

    <section className="settings-welcome"><div className="settings-welcome-orb" /><div className="settings-identity"><div className="settings-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div><div><span>WELCOME BACK</span><h2>{user?.name || 'EduTrack user'}</h2><p>{user?.email || 'Account details'}</p></div></div><div className="settings-role"><ShieldCheck size={17} /><span><small>ACCOUNT ROLE</small><strong>{user?.role || 'Member'}</strong></span></div></section>

    <div className="settings-content-grid">
      <div className="settings-main-column">
        <section className="panel settings-card" id="account-settings"><div className="settings-section-heading"><span className="settings-section-icon violet"><UserRound size={18} /></span><div><h2>Account overview</h2><p className="muted">Your current signed-in profile.</p></div></div><div className="settings-detail-list"><div><span>Full name</span><strong>{user?.name || '—'}</strong></div><div><span>Email address</span><strong>{user?.email || '—'}</strong></div><div><span>Role</span><strong className="role-tag">{user?.role || 'Member'}</strong></div></div></section>

        <section className="panel settings-card" id="workspace-settings"><div className="settings-section-heading"><span className="settings-section-icon blue"><SlidersHorizontal size={18} /></span><div><h2>Workspace preferences</h2><p className="muted">These choices are saved in this browser.</p></div></div>
          <div className="preference-row"><span className="preference-row-icon"><Users size={17} /></span><div className="preference-copy"><strong>Students per page</strong><small>Choose how many student records appear at a time.</small></div><select value={preferences.studentPageSize} onChange={(event) => updatePreference({ studentPageSize: Number(event.target.value) })} aria-label="Students per page"><option value={8}>8</option><option value={12}>12</option><option value={20}>20</option></select></div>
          <div className="preference-row"><span className="preference-row-icon"><Monitor size={17} /></span><div className="preference-copy"><strong>Compact tables</strong><small>Reduce row spacing to fit more records on screen.</small></div><PreferenceSwitch checked={preferences.compactTables} label="Compact tables" onChange={(compactTables) => updatePreference({ compactTables })} /></div>
          <div className="preference-row"><span className="preference-row-icon"><ShieldCheck size={17} /></span><div className="preference-copy"><strong>Confirm before deleting</strong><small>Ask before permanently removing a student record.</small></div><PreferenceSwitch checked={preferences.confirmDeletes} label="Confirm before deleting" onChange={(confirmDeletes) => updatePreference({ confirmDeletes })} /></div>
        </section>

        <section className="panel settings-card security-card" id="security-settings"><div className="settings-section-heading"><span className="settings-section-icon green"><ShieldCheck size={18} /></span><div><h2>Session & security</h2><p className="muted">A quick check of your current access.</p></div></div><div className="security-status"><span className="security-status-dot" /><div><strong>Signed in securely</strong><small>Your authenticated session is active in this browser.</small></div><span className="security-role">{user?.role || 'Member'}</span></div><button className="signout-action" onClick={signOut}><LogOut size={16} /> Sign out of EduTrack <ChevronRight size={16} /></button></section>
      </div>

      <aside className="settings-side-column"><section className="settings-tip-card"><div className="settings-tip-icon"><Bell size={19} /></div><h3>Preferences stay private</h3><p>Your display choices are saved locally in this browser. Account details come from your signed-in profile.</p></section><section className="settings-shortcuts"><h3>Workspace</h3><a href="#account-settings"><UserRound size={15} /> Account overview <ChevronRight size={15} /></a><a href="#workspace-settings"><SlidersHorizontal size={15} /> Preferences <ChevronRight size={15} /></a><a href="#security-settings"><ShieldCheck size={15} /> Session & security <ChevronRight size={15} /></a></section></aside>
    </div>
  </div>;
}

export function NotFound() { return <div className="center-page"><div><h1>404</h1><p className="muted">The page you’re looking for doesn’t exist.</p></div></div>; }
