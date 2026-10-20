import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Bell, BookOpenCheck, CalendarDays, Camera, GraduationCap, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const items = [
  { to: '/faculty/dashboard', label: 'Overview', icon: GraduationCap },
  { to: '/faculty/assignments', label: 'Assignments', icon: BookOpenCheck },
  { to: '/faculty/timetable', label: 'Timetable', icon: CalendarDays },
  { to: '/faculty/gallery', label: 'Gallery', icon: Camera }
];

export default function FacultyLayout({ children }) {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = async () => { await logout(); navigate('/faculty/sign-in'); };
  return <div className="faculty-shell">
    {open && <button className="faculty-scrim" aria-label="Close navigation" onClick={() => setOpen(false)} />}
    <aside className={`faculty-sidebar${open ? ' is-open' : ''}`}>
      <div className="faculty-brand"><span className="faculty-brand-mark"><GraduationCap size={21} /></span><span>EduTrack<small>FACULTY SPACE</small></span><button className="faculty-close" onClick={() => setOpen(false)} aria-label="Close menu"><X size={18} /></button></div>
      <div className="faculty-nav-label">TEACHING</div>
      <nav>{items.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/faculty/dashboard'} onClick={() => setOpen(false)} className={({ isActive }) => isActive ? 'active' : ''}><Icon size={18} /><span>{label}</span></NavLink>)}</nav>
      <div className="faculty-sidebar-bottom"><div className="faculty-profile"><span>{user?.name?.charAt(0)?.toUpperCase() || 'F'}</span><div><strong>{user?.name || 'Faculty member'}</strong><small>Faculty account</small></div></div><button onClick={signOut}><LogOut size={17} />Sign out</button></div>
    </aside>
    <div className="faculty-main"><header className="faculty-topbar"><button className="faculty-menu" onClick={() => setOpen(true)} aria-label="Open navigation"><Menu size={20} /></button><div className="faculty-breadcrumb">Faculty workspace <span>/</span> <strong>Teaching tools</strong></div><div className="faculty-top-actions"><span className="faculty-date">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span><button aria-label="Notifications"><Bell size={18} /><i /></button><div className="faculty-mini-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'F'}</div></div></header><main className="faculty-content">{children}</main></div>
  </div>;
}
