import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const initial = { studentId: '', fullName: '', email: '', phone: '', aadhaarNumber: '', dateOfBirth: '', gender: '', profileImageUrl: '', signatureImageUrl: '', course: '', semester: '', enrollmentDate: new Date().toISOString().slice(0, 10), address: '', guardianName: '', guardianPhone: '', status: 'Active' };
const imageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const maxImageSize = 1.5 * 1024 * 1024;

export default function StudentForm() {
  const { id } = useParams();
  const edit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [verifiedAadhaar, setVerifiedAadhaar] = useState('');
  const [otpOpen, setOtpOpen] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const aadhaarVerified = Boolean(form.aadhaarNumber && verifiedAadhaar === form.aadhaarNumber);

  useEffect(() => {
    if (!edit) return;
    api.get(`/students/${id}`).then(({ data }) => setForm({ ...initial, ...data.student, aadhaarNumber: '', dateOfBirth: data.student.dateOfBirth.slice(0, 10), enrollmentDate: data.student.enrollmentDate.slice(0, 10) })).catch(() => toast.error('Could not load student'));
  }, [id, edit]);

  const change = (e) => setForm((current) => ({ ...current, [e.target.name]: e.target.value }));

  const startAadhaarVerification = () => {
    if (!/^\d{12}$/.test(form.aadhaarNumber)) {
      toast.error('Enter a valid 12-digit Aadhaar number first');
      return;
    }
    setOtpInput('');
    setOtpError('');
    setVerificationSuccess(false);
    setOtpOpen(true);
  };

  const verifyDemoOtp = (event) => {
    event.preventDefault();
    if (otpInput !== '123456') {
      setOtpError('Incorrect demo OTP. Please try again.');
      return;
    }
    setVerifiedAadhaar(form.aadhaarNumber);
    setVerificationSuccess(true);
  };

  const uploadImage = (field) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!imageTypes.includes(file.type)) {
      toast.error('Choose a JPG, PNG, or WebP image');
      e.target.value = '';
      return;
    }
    if (file.size > maxImageSize) {
      toast.error('Each image must be 1.5 MB or smaller');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, [field]: reader.result }));
    reader.readAsDataURL(file);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!edit && !aadhaarVerified) {
      toast.error('Verify the Aadhaar number before creating the student');
      return;
    }
    setBusy(true);
    try {
      const payload = { ...form, aadhaarVerified: aadhaarVerified || (edit && !form.aadhaarNumber) };
      if (edit && !payload.aadhaarNumber) {
        delete payload.aadhaarNumber;
        delete payload.aadhaarVerified;
      }
      const { data } = await (edit ? api.put(`/students/${id}`, payload) : api.post('/students', payload));
      toast.success(edit ? 'Student updated' : 'Student added');
      navigate(edit ? '/students' : `/students/${data.student._id}/card`);
    } catch (error) {
      const errors = error.response?.data?.errors;
      toast.error(errors?.aadhaarNumber?.[0] || error.response?.data?.message || 'Please check the form');
    } finally {
      setBusy(false);
    }
  };

  const fields = [['studentId', 'Student ID', 'e.g. STU-2025-001'], ['fullName', 'Full name', 'Enter full name'], ['email', 'Email address', 'student@school.edu'], ['phone', 'Phone number', '+91 98765 43210'], ['dateOfBirth', 'Date of birth', ''], ['course', 'Course / department', 'e.g. Computer Science'], ['semester', 'Semester / year', 'e.g. Year 2'], ['enrollmentDate', 'Enrollment date', '']];

  return <>
    <div className="page-heading"><div><div className="eyebrow">STUDENT DIRECTORY</div><h1>{edit ? 'Edit student' : 'Add new student'}</h1><p className="muted">{edit ? 'Update this student’s information.' : 'Create a complete student profile.'}</p></div><Link className="secondary-button" to="/students">Cancel</Link></div>
    <form className="panel form-panel" onSubmit={submit}>
      <div className="form-section">
        <h2>Basic information</h2><p className="muted">Personal and academic details.</p>
        <div className="form-grid">
          {fields.map(([name, label, placeholder]) => <label key={name}>{label}<input required type={name.includes('Date') || name === 'dateOfBirth' || name === 'enrollmentDate' ? 'date' : name === 'email' ? 'email' : 'text'} name={name} value={form[name] || ''} onChange={change} placeholder={placeholder} /></label>)}
          <label className="aadhaar-field">Aadhaar number {!edit && <span aria-hidden="true">*</span>}<div className="aadhaar-input-row"><input name="aadhaarNumber" type="text" inputMode="numeric" autoComplete="off" pattern="[0-9]{12}" maxLength={12} minLength={12} required={!edit} value={form.aadhaarNumber} onChange={(e) => setForm((current) => ({ ...current, aadhaarNumber: e.target.value.replace(/\D/g, '') }))} placeholder="12-digit Aadhaar number" aria-describedby="aadhaar-help" />{aadhaarVerified ? <span className="aadhaar-verified"><ShieldCheck size={15} /> Verified</span> : <button type="button" className="secondary-button aadhaar-verify-button" onClick={startAadhaarVerification}>Verify</button>}</div></label>
          <label>Gender<select name="gender" value={form.gender} onChange={change}><option value="">Select gender</option><option>Female</option><option>Male</option><option>Other</option></select></label>
          <label>Status<select name="status" value={form.status} onChange={change}><option>Active</option><option>Inactive</option><option>Graduated</option></select></label>
          <p id="aadhaar-help" className="muted wide">Demo only: use OTP <strong>123456</strong>. No Aadhaar OTP is sent to UIDAI. On edit, leave the number blank to keep the existing one.</p>
        </div>
      </div>
      <div className="form-section">
        <h2>Photo & signature</h2><p className="muted">Upload JPG, PNG, or WebP files (up to 1.5 MB each).</p>
        <div className="form-grid">
          {[["profileImageUrl", 'Student photo', 'student-photo'], ["signatureImageUrl", 'Student signature', 'student-signature']].map(([field, label, id]) => <label key={field}>{label}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={uploadImage(field)} aria-label={label} />{form[field] && <span className="upload-preview"><img src={form[field]} alt={`${label} preview`} /><button type="button" className="secondary-button" onClick={() => setForm((current) => ({ ...current, [field]: '' }))}>Remove</button></span>}</label>)}
        </div>
      </div>
      <div className="form-section">
        <h2>Contact & guardian</h2>
        <div className="form-grid"><label className="wide">Address<textarea name="address" value={form.address} onChange={change} placeholder="Full address" /></label>{[['guardianName', 'Guardian name', 'Optional'], ['guardianPhone', 'Guardian phone', 'Optional']].map(([name, label, placeholder]) => <label key={name}>{label}<input name={name} value={form[name] || ''} onChange={change} placeholder={placeholder} /></label>)}</div>
      </div>
      <div className="form-actions"><Link className="secondary-button" to="/students">Cancel</Link><button className="primary-button" disabled={busy}>{busy ? 'Saving...' : edit ? 'Save changes' : 'Create student'}</button></div>
    </form>
    {otpOpen && <div className="verification-overlay"><section className="verification-dialog" role="dialog" aria-modal="true" aria-labelledby="aadhaar-verification-title">{verificationSuccess ? <div className="verification-success"><CheckCircle2 size={55} /><div className="eyebrow">DEMO FLOW</div><h2 id="aadhaar-verification-title">Verification successful</h2><p>Aadhaar number ending in {form.aadhaarNumber.slice(-4)} is marked verified for this demo.</p><button type="button" className="primary-button" onClick={() => setOtpOpen(false)}>Continue to student form</button></div> : <><button type="button" className="verification-close" onClick={() => setOtpOpen(false)}>Close</button><div className="eyebrow">DEMO OTP VERIFICATION</div><h2 id="aadhaar-verification-title">Verify Aadhaar number</h2><p className="muted">This is a local demo only. No OTP is sent to Aadhaar or UIDAI.</p><div className="demo-otp-code">Demo OTP: <strong>123456</strong></div><form onSubmit={verifyDemoOtp}><label>Enter 6-digit OTP<input type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" value={otpInput} onChange={(event) => { setOtpInput(event.target.value.replace(/\D/g, '')); setOtpError(''); }} required /></label>{otpError && <p className="otp-error" role="alert">{otpError}</p>}<button className="primary-button" type="submit">Verify OTP</button></form></>}</section></div>}
  </>;
}
