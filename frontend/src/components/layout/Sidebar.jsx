import { NavLink, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, ClipboardCheck, GraduationCap, Settings, LogOut, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { to: '/results', label: 'Examination Results', icon: GraduationCap },
  { to: '/settings', label: 'Settings', icon: Settings }
];
export default function Sidebar({ open, onClose }) {
  const { logout } = useAuth();
  const location = useLocation();
  const [hasRegisteredStudents, setHasRegisteredStudents] = useState(false);
  useEffect(() => {
    api.get('/students', { params: { limit: 1 } }).then(({ data }) => setHasRegisteredStudents(data.pagination.total > 0)).catch(() => setHasRegisteredStudents(false));
  }, [location.pathname]);
  return <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
    <div className="brand"><div className="brand-mark"><GraduationCap size={22} /></div><span>Edu<span className="accent">Track</span></span><button className="mobile-close" onClick={onClose}><X size={20} /></button></div>
    <nav>{links.map(({ to, label, icon: Icon }) => {
      const attendanceLocked = to === '/attendance' && !hasRegisteredStudents;
      const portalClass = to === '/admin/sign-in' ? ' portal-admin-link' : to === '/faculty/sign-in' ? ' portal-faculty-link' : '';
      return <NavLink key={to} to={attendanceLocked ? '/students/new' : to} end={to === '/dashboard'} onClick={onClose} title={attendanceLocked ? 'Register at least one student to unlock attendance' : undefined} className={({ isActive }) => `${isActive ? 'active' : ''}${attendanceLocked ? ' attendance-locked' : ''}${portalClass}`}><Icon size={19} />{label}</NavLink>;
    })}</nav>
    <button className="logout-button" onClick={logout}><LogOut size={19} />Sign out</button>
  </aside>;
}
