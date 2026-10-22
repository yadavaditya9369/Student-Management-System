import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowLeft, ArrowRight, CalendarDays, ClipboardCheck, GraduationCap, Users, BookOpen, Bus, House, Library, WalletCards } from 'lucide-react';
import api from '../services/api';
import Loader from '../components/common/Loader';

const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const monthLabel = (date) => date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [feeSummary, setFeeSummary] = useState(null);
  const [month, setMonth] = useState(() => new Date());
  const [error, setError] = useState('');
  useEffect(() => {
    api.get('/dashboard').then(({ data: result }) => setData(result)).catch((err) => setError(err.response?.data?.message || 'Dashboard data could not be loaded.'));
  }, []);
  useEffect(() => { api.get('/fees/summary').then(({ data: result }) => setFeeSummary(result.summary)).catch(() => setFeeSummary(null)); }, []);

  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const mondayOffset = (first.getDay() + 6) % 7;
    const start = new Date(first); start.setDate(first.getDate() - mondayOffset);
    return Array.from({ length: 42 }, (_, index) => { const date = new Date(start); date.setDate(start.getDate() + index); return date; });
  }, [month]);

  if (!data && !error) return <Loader />;
  if (error) return <section className="panel dashboard-error"><h1>Dashboard unavailable</h1><p>{error}</p><button className="primary-button" onClick={() => window.location.reload()}>Try again</button></section>;

  const cards = [
    { label: 'Students', value: data.stats.totalStudents, icon: GraduationCap, tone: 'coral', note: `${data.stats.activeStudents} active` },
    { label: 'Attendance today', value: `${data.stats.todayAttendance}%`, icon: ClipboardCheck, tone: 'orange', note: `${data.stats.presentToday} present` },
    { label: 'Exam records', value: data.stats.totalResults, icon: Activity, tone: 'yellow', note: `${data.stats.averageResults}% average score` },
    { label: 'Courses / classes', value: data.stats.totalCourses, icon: Users, tone: 'lime', note: 'From student records' }
  ];
  const eventDays = new Set(data.calendarDates.map((item) => dateKey(new Date(`${item}T00:00:00`))));
  const feeCategories = [
    { key: 'academic', label: 'Academic fee', icon: GraduationCap, note: 'Tuition & term charges', tone: 'academic' },
    { key: 'hostel', label: 'Hostel fee', icon: House, note: 'Residence & mess', tone: 'hostel' },
    { key: 'library', label: 'Library fee', icon: BookOpen, note: 'Membership & late fees', tone: 'library' },
    { key: 'bus', label: 'Bus fee', icon: Bus, note: 'Transport routes', tone: 'bus' }
  ];
  const formatRupees = (amount = 0) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

  return <div className="school-dashboard">
    <div className="school-dashboard-heading"><div><span>OVERVIEW</span><h1>Dashboard</h1><p>Here’s the latest activity across your school.</p></div><Link className="secondary-button" to="/students/new">+ Add student</Link></div>
    <section className="school-stat-grid">{cards.map(({ label, value, icon: Icon, tone, note }) => <article className={`school-stat-card ${tone}`} key={label}><div className="school-stat-top"><span>{label}</span><Icon size={25} /></div><strong>{value}</strong><small>{note}</small></article>)}</section>
    <section className="school-panel fee-overview-panel"><div className="school-panel-heading"><div><span className="finance-eyebrow"><WalletCards size={14} /> FINANCE OVERVIEW</span><h2>Fee collections</h2><p>Track fee categories and open the collection register.</p></div><Link to="/fees">Manage fees <ArrowRight size={14} /></Link></div><div className="fee-overview-grid">{feeCategories.map(({ key, label, icon: Icon, note, tone }) => { const category = feeSummary?.categories?.find((item) => item.id === key); return <Link to={`/fees?category=${key}`} className={`fee-overview-card ${tone}`} key={key}><span className="fee-overview-icon"><Icon size={18} /></span><span className="fee-overview-copy"><small>{label}</small><strong>{formatRupees(category?.collected)}</strong><em>{formatRupees((category?.pending || 0) + (category?.overdue || 0))} outstanding · {note}</em></span><ArrowRight size={15} /></Link>; })}</div></section>
    <div className="school-dashboard-grid">
      <section className="school-panel calendar-panel"><div className="school-panel-heading"><div><h2>Activities calendar</h2><p>Attendance and exam activity from your records</p></div><div className="calendar-legend"><span><i className="legend-attendance" /> Attendance</span><span><i className="legend-exam" /> Exams</span></div></div>
        <div className="calendar-toolbar"><div className="calendar-controls"><button aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ArrowLeft size={16} /></button><button onClick={() => setMonth(new Date())}>Today</button><button aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ArrowRight size={16} /></button></div><strong>{monthLabel(month)}</strong><span className="calendar-view"><CalendarDays size={15} /> Month</span></div>
        <div className="school-calendar"><div className="calendar-weekdays">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => <span key={day}>{day}</span>)}</div><div className="calendar-days">{days.map((date) => { const key = dateKey(date); const current = date.getMonth() === month.getMonth(); return <div className={`calendar-day ${current ? '' : 'outside'} ${key === dateKey(new Date()) ? 'today' : ''}`} key={key}><span>{date.getDate()}</span>{eventDays.has(key) && <i className="calendar-event" title="Attendance or exam record" />}</div>; })}</div></div>
        <p className="calendar-footnote">Calendar markers show dates with saved attendance or examination records.</p>
      </section>
      <section className="school-panel exams-panel"><div className="school-panel-heading"><div><h2>Recent exams</h2><p>Latest examination results</p></div><Link to="/results">View all <ArrowRight size={14} /></Link></div>{data.recentResults.length ? <div className="exam-list">{data.recentResults.map((result) => <article className="exam-row" key={result._id}><div className="exam-date"><strong>{new Date(result.createdAt).toLocaleDateString(undefined, { day: '2-digit' })}</strong><span>{new Date(result.createdAt).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}</span></div><div className="exam-info"><strong>{result.exam}</strong><span>{result.subject} · {result.student?.fullName || 'Student'}</span></div><b>{result.marks}/{result.maxMarks}</b></article>)}</div> : <div className="dashboard-empty">No exam results have been recorded yet.<Link to="/results">Add a result</Link></div>}
        <div className="exam-summary"><span>Average result</span><strong>{data.stats.averageResults}%</strong></div></section>
    </div>
    <section className="school-panel recent-students-panel"><div className="school-panel-heading"><div><h2>Recently enrolled students</h2><p>Latest student profiles from the backend</p></div><Link to="/students">All students <ArrowRight size={14} /></Link></div>{data.recentStudents.length ? <div className="school-recent-list">{data.recentStudents.map((student) => <Link to="/students" className="school-recent-row" key={student._id}><span>{student.fullName.charAt(0)}</span><strong>{student.fullName}<small>{student.studentId} · {student.course}</small></strong><em>{student.status}</em></Link>)}</div> : <div className="dashboard-empty">No students added yet.<Link to="/students/new">Add a student</Link></div>}</section>
  </div>;
}
