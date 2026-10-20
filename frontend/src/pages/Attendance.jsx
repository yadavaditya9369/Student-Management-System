import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, X, Camera, RotateCcw, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Loader from '../components/common/Loader';

export default function Attendance() {
  const [students, setStudents] = useState(null);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [records, setRecords] = useState({});
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [photo, setPhoto] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [saving, setSaving] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setStudents(null);
    Promise.all([
      api.get('/students', { params: { limit: 100 } }),
      api.get('/attendance', { params: { date } })
    ]).then(([studentResponse, attendanceResponse]) => {
      if (cancelled) return;
      setRegisteredCount(studentResponse.data.pagination.total);
      setStudents(studentResponse.data.students.filter((student) => student.status === 'Active'));
      setRecords(Object.fromEntries(attendanceResponse.data.records.map((record) => [record.student._id, { status: record.status, verificationCaptured: record.verificationCaptured }])));
    }).catch(() => {
      if (cancelled) return;
      setStudents([]);
      toast.error('Could not load attendance data');
    });
    return () => { cancelled = true; };
  }, [date]);

  useEffect(() => {
    if (!selectedStudent) return undefined;
    let active = true;
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera access requires HTTPS (or localhost) and a supported browser.');
      return undefined;
    }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false }).then((stream) => {
      if (!active) { stream.getTracks().forEach((track) => track.stop()); return; }
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraError('');
    }).catch(() => setCameraError('Allow camera access in your browser to verify attendance.'));
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [selectedStudent]);

  const closeCamera = () => { setSelectedStudent(null); setPhoto(''); setCameraError(''); };
  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video?.videoWidth || !canvas) return toast.error('Camera is not ready yet');
    const scale = Math.min(1, 900 / video.videoWidth);
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    setPhoto(canvas.toDataURL('image/jpeg', 0.78));
  };

  const mark = async (student, status, verificationPhoto = '') => {
    try {
      await api.post('/attendance', { student, date, status, ...(verificationPhoto ? { verificationPhoto } : {}) });
      setRecords((current) => ({ ...current, [student]: { status, verificationCaptured: Boolean(verificationPhoto) } }));
      toast.success('Attendance saved');
      closeCamera();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save attendance');
    }
  };

  if (!students) return <Loader />;
  if (registeredCount === 0) return <section className="panel attendance-gate"><div className="attendance-gate-icon"><Users size={24} /></div><h1>Register a student first</h1><p className="muted">Attendance unlocks after the first student profile is registered.</p><Link className="primary-button" to="/students/new">Register student</Link></section>;

  return <>
    <div className="page-heading"><div><div className="eyebrow">DAILY RECORD</div><h1>Attendance</h1><p className="muted">Capture a live verification photo before marking a student present.</p></div><label className="date-control"><CalendarDays size={17} /><input type="date" value={date} onChange={(event) => setDate(event.target.value)} /></label></div>
    {students.length === 0 ? <section className="panel attendance-gate"><h2>No active students</h2><p className="muted">Register a student or activate an existing student profile to take attendance.</p><Link className="primary-button" to="/students">Manage students</Link></section> : <section className="panel table-panel">
      <div className="attendance-summary"><div><strong>{Object.keys(records).length}</strong><span>Marked</span></div><div><strong className="green-text">{Object.values(records).filter((record) => record.status === 'Present').length}</strong><span>Present</span></div><div><strong className="red-text">{Object.values(records).filter((record) => record.status === 'Absent').length}</strong><span>Absent</span></div></div>
      <div className="table-scroll"><table><thead><tr><th>Student</th><th>ID</th><th>Course</th><th>Attendance status</th></tr></thead><tbody>{students.map((student) => <tr key={student._id}><td><div className="table-student"><div className="student-avatar">{student.fullName.charAt(0)}</div><strong>{student.fullName}</strong></div></td><td className="mono">{student.studentId}</td><td>{student.course}</td><td><div className="attendance-buttons"><button className={records[student._id]?.status === 'Present' ? 'selected present' : ''} onClick={() => { setPhoto(''); setCameraError(''); setSelectedStudent(student); }}><Camera size={15} /> Verify & present</button><button className={records[student._id]?.status === 'Absent' ? 'selected absent' : ''} onClick={() => mark(student._id, 'Absent')}><X size={15} /> Absent</button>{records[student._id]?.verificationCaptured && <span className="photo-verified">Photo captured</span>}</div></td></tr>)}</tbody></table></div>
    </section>}
    {selectedStudent && <div className="camera-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCamera(); }}><section className="camera-dialog" role="dialog" aria-modal="true" aria-labelledby="camera-title"><button type="button" className="camera-close" onClick={closeCamera} aria-label="Close">Close</button><div className="eyebrow">LIVE VERIFICATION</div><h2 id="camera-title">Confirm {selectedStudent.fullName}</h2><p className="muted">Capture a current photo to mark this student present. Camera access works on HTTPS or localhost.</p>{photo ? <img className="camera-preview" src={photo} alt="Attendance verification capture" /> : <div className="camera-frame">{cameraError ? <p role="alert">{cameraError}</p> : <video ref={videoRef} autoPlay playsInline muted />}</div>}<canvas ref={canvasRef} hidden /><div className="camera-actions">{photo ? <><button className="secondary-button" onClick={() => setPhoto('')}><RotateCcw size={15} /> Retake</button><button className="primary-button" disabled={saving} onClick={async () => { setSaving(true); await mark(selectedStudent._id, 'Present', photo); setSaving(false); }}>{saving ? 'Saving...' : 'Confirm present'}</button></> : <button className="primary-button" disabled={Boolean(cameraError)} onClick={capturePhoto}><Camera size={16} /> Capture photo</button>}</div></section></div>}
  </>;
}
