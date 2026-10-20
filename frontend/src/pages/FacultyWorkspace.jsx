import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, CalendarDays, Camera, Check, Clock3, FileText, ImagePlus, MapPin, Plus, Trash2, Upload, Users, X } from 'lucide-react';
import toast from 'react-hot-toast';

const assignmentKey = 'edutrack.faculty.assignments';
const readAssignments = () => { try { return JSON.parse(localStorage.getItem(assignmentKey) || '[]'); } catch { return []; } };
const timetableKey = 'edutrack.faculty.timetable';
const defaultClasses = [
  { id: 'seed-mon-09', day: 'Monday', time: '09:00', subject: 'Mathematics', group: 'Grade 10 · A', room: 'Room 204', color: 'blue' },
  { id: 'seed-mon-11', day: 'Monday', time: '11:00', subject: 'Algebra II', group: 'Grade 11 · B', room: 'Room 108', color: 'violet' },
  { id: 'seed-tue-10', day: 'Tuesday', time: '10:00', subject: 'Mathematics', group: 'Grade 10 · A', room: 'Room 204', color: 'blue' },
  { id: 'seed-wed-09', day: 'Wednesday', time: '09:00', subject: 'Geometry', group: 'Grade 9 · C', room: 'Room 212', color: 'amber' },
  { id: 'seed-thu-11', day: 'Thursday', time: '11:00', subject: 'Algebra II', group: 'Grade 11 · B', room: 'Room 108', color: 'violet' },
  { id: 'seed-fri-10', day: 'Friday', time: '10:00', subject: 'Mathematics', group: 'Grade 10 · A', room: 'Room 204', color: 'blue' }
];
const upcoming = [
  { time: '09:00', subject: 'Mathematics', group: 'Grade 10 · A', room: 'Room 204', tone: 'blue' },
  { time: '11:00', subject: 'Algebra II', group: 'Grade 11 · B', room: 'Room 108', tone: 'violet' },
  { time: '13:30', subject: 'Faculty planning', group: 'Department meeting', room: 'Staff room', tone: 'gold' }
];

function Header({ eyebrow, title, detail, action }) {
  return <div className="faculty-page-heading"><div><span>{eyebrow}</span><h1>{title}</h1><p>{detail}</p></div>{action}</div>;
}

export function FacultyDashboard() {
  const assignments = readAssignments();
  const galleryCount = Number(localStorage.getItem('edutrack.faculty.galleryCount') || 0);
  return <div className="faculty-dashboard">
    <Header eyebrow="YOUR TEACHING SPACE" title="Good morning, educator" detail="Your classes, tasks and school moments, all in one place." action={<Link className="faculty-primary-button" to="/faculty/assignments"><Plus size={16} /> New assignment</Link>} />
    <section className="faculty-welcome"><div className="faculty-welcome-copy"><span>THIS WEEK AT A GLANCE</span><h2>Great teaching starts<br />with a clear plan.</h2><p>Keep your classwork organized and make room for the moments that matter.</p><Link to="/faculty/timetable">View this week <ArrowRight size={15} /></Link></div><div className="faculty-welcome-art"><div className="faculty-art-circle"><BookOpenCheck size={42} /></div><span className="art-dot one" /><span className="art-dot two" /><span className="art-note">Plan · Teach · Inspire</span></div></section>
    <section className="faculty-metric-grid"><article><span className="metric-icon blue"><Users size={18} /></span><div><small>Classes today</small><strong>3</strong><em>Across 2 year groups</em></div></article><article><span className="metric-icon violet"><FileText size={18} /></span><div><small>Active assignments</small><strong>{assignments.length}</strong><em>Keep student work moving</em></div></article><article><span className="metric-icon green"><Check size={18} /></span><div><small>Work reviewed</small><strong>24</strong><em>This week</em></div></article><article><span className="metric-icon amber"><Camera size={18} /></span><div><small>Gallery moments</small><strong>{galleryCount}</strong><em>Shared with your school</em></div></article></section>
    <div className="faculty-home-grid"><section className="faculty-card faculty-today-card"><div className="faculty-card-heading"><div><span className="faculty-kicker">YOUR SCHEDULE</span><h2>Today's plan</h2></div><Link to="/faculty/timetable">Full timetable <ArrowRight size={14} /></Link></div><div className="faculty-today-list">{upcoming.map((item) => <article key={item.time} className={`faculty-event ${item.tone}`}><span className="event-time">{item.time}</span><i /><div><strong>{item.subject}</strong><small>{item.group}</small></div><span className="event-place"><MapPin size={13} />{item.room}</span></article>)}</div></section><section className="faculty-card faculty-tasks-card"><div className="faculty-card-heading"><div><span className="faculty-kicker">KEEP IT MOVING</span><h2>Quick actions</h2></div></div><Link to="/faculty/assignments" className="faculty-quick-action"><span className="quick-icon violet"><BookOpenCheck size={18} /></span><span><strong>Assign classwork</strong><small>Share the next learning task</small></span><ArrowRight size={16} /></Link><Link to="/faculty/gallery" className="faculty-quick-action"><span className="quick-icon green"><ImagePlus size={18} /></span><span><strong>Add a class moment</strong><small>Build your school gallery</small></span><ArrowRight size={16} /></Link><Link to="/faculty/timetable" className="faculty-quick-action"><span className="quick-icon blue"><CalendarDays size={18} /></span><span><strong>Check your week</strong><small>See classes and room details</small></span><ArrowRight size={16} /></Link></section></div>
    <div className="faculty-note"><span><Clock3 size={17} /></span><p><strong>One step at a time.</strong> Your teaching workspace keeps your class planning together so you can focus on your students.</p><Link to="/faculty/assignments">Go to assignments <ArrowRight size={14} /></Link></div>
  </div>;
}

export function FacultyAssignments() {
  const [items, setItems] = useState(readAssignments);
  const [form, setForm] = useState({ title: '', subject: '', group: '', dueDate: '', instructions: '' });
  const [showForm, setShowForm] = useState(false);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const add = (event) => {
    event.preventDefault();
    const next = [{ ...form, id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'Assigned' }, ...items];
    localStorage.setItem(assignmentKey, JSON.stringify(next)); setItems(next); setForm({ title: '', subject: '', group: '', dueDate: '', instructions: '' }); setShowForm(false); toast.success('Assignment added to your class list');
  };
  const remove = (id) => { const next = items.filter((item) => item.id !== id); localStorage.setItem(assignmentKey, JSON.stringify(next)); setItems(next); toast.success('Assignment removed'); };
  return <div><Header eyebrow="CLASSWORK" title="Assignments" detail="Create and organize learning tasks for your classes." action={<button className="faculty-primary-button" onClick={() => setShowForm(!showForm)}><Plus size={16} /> Assign work</button>} />
    {showForm && <form className="faculty-card assignment-form" onSubmit={add}><div className="faculty-card-heading"><div><span className="faculty-kicker">NEW CLASSWORK</span><h2>Assignment details</h2></div><button type="button" className="faculty-icon-button" onClick={() => setShowForm(false)} aria-label="Close"><X size={18} /></button></div><div className="faculty-form-grid"><label>Assignment title<input required value={form.title} onChange={update('title')} placeholder="e.g. Linear equations practice" /></label><label>Subject<input required value={form.subject} onChange={update('subject')} placeholder="Mathematics" /></label><label>Class / group<input required value={form.group} onChange={update('group')} placeholder="Grade 10 · A" /></label><label>Due date<input type="date" required value={form.dueDate} onChange={update('dueDate')} /></label><label className="full-field">Instructions<textarea value={form.instructions} onChange={update('instructions')} rows="3" placeholder="Add instructions or a short note for students" /></label></div><button className="faculty-primary-button" type="submit"><Check size={16} /> Assign to class</button></form>}
    <section className="faculty-card assignment-list-card"><div className="faculty-card-heading"><div><span className="faculty-kicker">CLASS TASKS</span><h2>Assigned work <span className="count-pill">{items.length}</span></h2></div><span className="faculty-muted">Saved in this browser</span></div>{items.length ? <div className="assignment-list">{items.map((item) => <article key={item.id} className="assignment-row"><span className="assignment-file-icon"><FileText size={19} /></span><div className="assignment-details"><strong>{item.title}</strong><small>{item.subject} <i /> {item.group}</small>{item.instructions && <p>{item.instructions}</p>}</div><div className="assignment-due"><small>DUE DATE</small><strong>{new Date(`${item.dueDate}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</strong></div><span className="assignment-status">Assigned</span><button className="faculty-icon-button remove-assignment" onClick={() => remove(item.id)} aria-label={`Remove ${item.title}`}><Trash2 size={16} /></button></article>)}</div> : <div className="faculty-empty"><span><BookOpenCheck size={24} /></span><strong>No assignments yet</strong><p>Create your first class task and it will appear here.</p><button className="faculty-secondary-button" onClick={() => setShowForm(true)}><Plus size={15} /> Create an assignment</button></div>}</section>
  </div>;
}

export function FacultyGallery() {
  const [photos, setPhotos] = useState([]);
  const [filter, setFilter] = useState('All moments');
  const addPhotos = (event) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith('image/'));
    const newPhotos = files.map((file) => ({ id: crypto.randomUUID(), name: file.name, src: URL.createObjectURL(file), date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }));
    setPhotos((current) => [...newPhotos, ...current]);
    if (newPhotos.length) { localStorage.setItem('edutrack.faculty.galleryCount', String(photos.length + newPhotos.length)); toast.success(`${newPhotos.length} photo${newPhotos.length > 1 ? 's' : ''} added`); }
    event.target.value = '';
  };
  const remove = (id) => { const next = photos.filter((photo) => photo.id !== id); URL.revokeObjectURL(photos.find((photo) => photo.id === id)?.src); setPhotos(next); localStorage.setItem('edutrack.faculty.galleryCount', String(next.length)); };
  return <div><Header eyebrow="SCHOOL LIFE" title="Class gallery" detail="Capture and celebrate the moments that make learning memorable." action={<label className="faculty-primary-button gallery-upload-button"><Upload size={16} /> Upload photos<input type="file" accept="image/*" multiple onChange={addPhotos} /></label>} />
    <section className="faculty-gallery-banner"><div><span>YOUR CLASS, IN PICTURES</span><h2>Little moments.<br />Big memories.</h2><p>Bring classroom projects, celebrations and everyday discoveries together.</p></div><div className="gallery-banner-art"><Camera size={38} /><span /><span /></div></section>
    <div className="gallery-toolbar"><div><strong>Recent moments</strong><span>{photos.length} {photos.length === 1 ? 'photo' : 'photos'}</span></div><select value={filter} onChange={(event) => setFilter(event.target.value)} aria-label="Gallery filter"><option>All moments</option><option>Recently added</option></select></div>
    {photos.length ? <div className="faculty-photo-grid">{photos.map((photo) => <article className="faculty-photo-card" key={photo.id}><img src={photo.src} alt={photo.name} /><div><span><strong>{photo.name}</strong><small>{photo.date} · Class moment</small></span><button className="faculty-icon-button" onClick={() => remove(photo.id)} aria-label={`Remove ${photo.name}`}><Trash2 size={15} /></button></div></article>)}</div> : <label className="faculty-gallery-empty"><span><ImagePlus size={25} /></span><strong>Your gallery is ready for its first moment</strong><small>Choose photos from your device to preview them here.</small><span className="faculty-secondary-button"><Upload size={15} /> Select photos</span><input type="file" accept="image/*" multiple onChange={addPhotos} /></label>}
    <p className="faculty-storage-note">Gallery previews are kept in this browser session and are not uploaded to a shared school server.</p>
  </div>;
}

export function FacultyTimetable() {
  const [day, setDay] = useState('Monday');
  const [classes, setClasses] = useState(() => { try { return JSON.parse(localStorage.getItem(timetableKey) || 'null') || defaultClasses; } catch { return defaultClasses; } });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ day: 'Monday', time: '09:00', subject: '', group: '', room: '' });
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const schedule = useMemo(() => classes.filter((item) => item.day === day).sort((a, b) => a.time.localeCompare(b.time)), [classes, day]);
  const addClass = (event) => { event.preventDefault(); const next = [...classes, { ...form, id: crypto.randomUUID(), color: 'green' }]; setClasses(next); localStorage.setItem(timetableKey, JSON.stringify(next)); setDay(form.day); setForm({ day: 'Monday', time: '09:00', subject: '', group: '', room: '' }); setShowForm(false); toast.success('Class added to your timetable'); };
  const removeClass = (id) => { const next = classes.filter((item) => item.id !== id); setClasses(next); localStorage.setItem(timetableKey, JSON.stringify(next)); };
  return <div><Header eyebrow="PLAN YOUR WEEK" title="Teaching timetable" detail="A clear view of your classes, teaching groups and rooms." action={<div className="faculty-heading-actions"><button className="faculty-secondary-button" onClick={() => window.print()}><CalendarDays size={15} /> Print week</button><button className="faculty-primary-button" onClick={() => setShowForm(!showForm)}><Plus size={15} /> Add class</button></div>} />
    {showForm && <form className="faculty-card assignment-form" onSubmit={addClass}><div className="faculty-card-heading"><div><span className="faculty-kicker">NEW TIMETABLE SESSION</span><h2>Class details</h2></div><button type="button" className="faculty-icon-button" onClick={() => setShowForm(false)} aria-label="Close"><X size={18} /></button></div><div className="faculty-form-grid"><label>Day<select required value={form.day} onChange={(event) => setForm({ ...form, day: event.target.value })}>{days.map((name) => <option key={name}>{name}</option>)}</select></label><label>Start time<input type="time" required value={form.time} onChange={(event) => setForm({ ...form, time: event.target.value })} /></label><label>Class / subject<input required value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} placeholder="Mathematics" /></label><label>Teaching group<input required value={form.group} onChange={(event) => setForm({ ...form, group: event.target.value })} placeholder="Grade 10 · A" /></label><label>Room<input required value={form.room} onChange={(event) => setForm({ ...form, room: event.target.value })} placeholder="Room 204" /></label></div><button className="faculty-primary-button" type="submit"><Check size={16} /> Save class</button></form>}
    <div className="faculty-timetable-summary"><div><span className="faculty-kicker">WEEKLY OVERVIEW</span><h2>Week of {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</h2><p>Six scheduled teaching sessions · Monday to Friday</p></div><div className="timetable-summary-icon"><CalendarDays size={24} /></div></div>
    <div className="timetable-day-tabs">{days.map((name) => <button key={name} onClick={() => setDay(name)} className={day === name ? 'active' : ''}><small>{name.slice(0, 3)}</small><strong>{name === 'Monday' ? '20' : name === 'Tuesday' ? '21' : name === 'Wednesday' ? '22' : name === 'Thursday' ? '23' : '24'}</strong></button>)}</div>
    <section className="faculty-card timetable-card"><div className="faculty-card-heading"><div><span className="faculty-kicker">DAILY SCHEDULE</span><h2>{day}</h2></div><span className="class-count">{schedule.length} {schedule.length === 1 ? 'session' : 'sessions'}</span></div>{schedule.length ? <div className="timetable-list">{schedule.map((item) => <article key={item.id || `${item.day}-${item.time}`} className={`timetable-row ${item.color}`}><div className="timetable-time"><strong>{item.time}</strong><small>{Number(item.time.slice(0, 2)) < 12 ? 'AM' : 'PM'}</small></div><span className="timetable-color-line" /><div className="timetable-class"><strong>{item.subject}</strong><span>{item.group}</span></div><span className="timetable-room"><MapPin size={14} />{item.room}</span><div className="timetable-row-actions"><span className="timetable-duration"><Clock3 size={14} />50 min</span><button className="faculty-icon-button" onClick={() => removeClass(item.id)} aria-label={`Remove ${item.subject}`}><Trash2 size={15} /></button></div></article>)}</div> : <div className="faculty-empty timetable-empty"><span><CalendarDays size={24} /></span><strong>A little breathing room</strong><p>No classes are scheduled for {day}.</p></div>}</section>
    <div className="faculty-timetable-foot"><Clock3 size={16} /><span>Remember to allow a few minutes between classes to reset and prepare.</span></div>
  </div>;
}
