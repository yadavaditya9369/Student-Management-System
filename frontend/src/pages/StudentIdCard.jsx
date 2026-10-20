import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Printer } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Loader from '../components/common/Loader';

const code39 = {
  '0': 0x034, '1': 0x121, '2': 0x061, '3': 0x160, '4': 0x031,
  '5': 0x130, '6': 0x070, '7': 0x025, '8': 0x124, '9': 0x064,
  A: 0x109, B: 0x049, C: 0x148, D: 0x019, E: 0x118, F: 0x058,
  G: 0x00d, H: 0x10c, I: 0x04c, J: 0x01c, K: 0x103, L: 0x043,
  M: 0x142, N: 0x013, O: 0x112, P: 0x052, Q: 0x007, R: 0x106,
  S: 0x046, T: 0x016, U: 0x181, V: 0x0c1, W: 0x1c0, X: 0x091,
  Y: 0x190, Z: 0x0d0, '-': 0x085, '.': 0x184, ' ': 0x0c4,
  '$': 0x0a8, '/': 0x0a2, '+': 0x08a, '%': 0x02a, '*': 0x094
};

function Code39Barcode({ value }) {
  const encoded = `*${value.toUpperCase()}*`;
  let x = 10;
  const bars = [];
  [...encoded].forEach((character, characterIndex) => {
    const pattern = code39[character];
    if (pattern === undefined) return;
    for (let index = 0; index < 9; index += 1) {
      const wide = (pattern & (1 << (8 - index))) !== 0;
      const width = wide ? 3 : 1;
      if (index % 2 === 0) bars.push(<rect key={`${characterIndex}-${index}`} x={x} y="4" width={width} height="48" fill="#171725" />);
      x += width + 1;
    }
    x += 1;
  });
  return <svg className="id-barcode" viewBox={`0 0 ${x + 9} 72`} role="img" aria-label={`Code 39 barcode for student ID ${value}`} shapeRendering="crispEdges">{bars}<text x="50%" y="68" textAnchor="middle" fontFamily="monospace" fontSize="11" fill="#171725">{value}</text></svg>;
}

export default function StudentIdCard() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  useEffect(() => {
    api.get(`/students/${id}`).then(({ data }) => setStudent(data.student)).catch(() => toast.error('Could not load student ID card'));
  }, [id]);

  if (!student) return <Loader />;
  return <div className="id-card-page">
    <div className="page-heading id-card-toolbar"><div><div className="eyebrow">STUDENT DIRECTORY</div><h1>Student ID card</h1><p className="muted">Card generated for {student.fullName}.</p></div><div className="id-card-actions"><Link className="secondary-button" to="/students">Back to students</Link><button className="primary-button" onClick={() => window.print()}><Printer size={16} /> Print card</button></div></div>
    <article className="student-id-card">
      <header className="student-id-card-header"><span className="id-card-emblem">E</span><div><strong>EDUTRACK</strong><small>STUDENT IDENTITY CARD</small></div><span className="id-card-year">STUDENT</span></header>
      <div className="student-id-card-body">
        {student.profileImageUrl ? <img className="id-card-photo" src={student.profileImageUrl} alt={`${student.fullName} student photo`} /> : <div className="id-card-photo id-card-placeholder">{student.fullName.charAt(0).toUpperCase()}</div>}
        <div className="id-card-details"><h2>{student.fullName}</h2><p><span>STUDENT ID</span><strong>{student.studentId}</strong></p><p><span>COURSE</span><strong>{student.course}</strong></p><p><span>SEMESTER / YEAR</span><strong>{student.semester}</strong></p><p><span>ENROLLMENT DATE</span><strong>{new Date(student.enrollmentDate).toLocaleDateString()}</strong></p></div>
      </div>
      <div className="student-id-card-footer"><Code39Barcode value={student.studentId} /><div className="id-card-status">{student.status}</div></div>
      {student.signatureImageUrl && <div className="id-card-signature"><img src={student.signatureImageUrl} alt="Student signature" /><span>Student signature</span></div>}
    </article>
    <p className="muted id-card-note">Keep this card for identification. The barcode encodes the student ID only.</p>
  </div>;
}
