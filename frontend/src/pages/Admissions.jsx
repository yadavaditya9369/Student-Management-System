import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, CheckCircle2, GraduationCap, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Admissions() {
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    try {
      const { data } = await api.post('/support', { ...values, type: 'admissions' });
      toast.success(data.message);
      form.reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send your inquiry. Please try again.');
    } finally { setBusy(false); }
  };

  return <div className="school-portal admissions-page">
    <header className="portal-header admissions-header">
      <Link to="/" className="portal-school-brand"><span className="portal-crest"><GraduationCap size={25} /></span><span><strong>EDUTRACK SCHOOL</strong><small>Learning together, growing every day</small></span></Link>
      <nav><Link to="/">Home</Link><Link to="/#discover">Discover</Link><Link className="active" to="/admissions">Admissions</Link><Link to="/#admissions">Contact Us</Link></nav>
    </header>
    <main className="admissions-content">
      <Link to="/" className="admissions-back"><ArrowLeft size={15} /> Back to home</Link>
      <div className="admissions-hero"><span>ADMISSIONS</span><h1>Start your learning<br />journey with us.</h1><p>Tell us a little about your family and our admissions team will follow up with the next steps.</p></div>
      <div className="admissions-layout">
        <section className="admissions-info">
          <h2>We’re glad you’re here.</h2><p>Every student brings a unique story. Share your interest with us, and we’ll help you understand the enrollment process and what information to prepare.</p>
          <article><span><BookOpen size={19} /></span><div><strong>Learn about our school</strong><p>Ask us about learning, student life and the support available to families.</p></div></article>
          <article><span><CheckCircle2 size={19} /></span><div><strong>Understand the next steps</strong><p>Our team can explain the application process and answer your questions.</p></div></article>
          <p className="admissions-note">Submitting this form sends an inquiry only. It does not create an account or confirm enrollment.</p>
        </section>
        <form className="portal-support-form admissions-form" onSubmit={submit}>
          <div className="portal-form-heading"><span><Send size={19} /></span><div><h3>Admissions inquiry</h3><p>We’ll reply using the contact details you provide.</p></div></div>
          <label>Parent / guardian name<input name="name" required minLength="2" maxLength="120" placeholder="Full name" /></label>
          <label>Email address<input name="email" required type="email" maxLength="254" placeholder="you@example.com" /></label>
          <label>Student’s name<input name="studentName" required minLength="2" maxLength="120" placeholder="Student full name" /></label>
          <label>Year / grade of interest<input name="subject" required minLength="3" maxLength="160" placeholder="For example, Grade 6" /></label>
          <label>Message<textarea name="message" required minLength="10" maxLength="3000" rows="4" placeholder="Tell us what you’d like to know" /></label>
          <button disabled={busy}>{busy ? 'Sending…' : 'Send inquiry'} <Send size={15} /></button>
        </form>
      </div>
    </main>
    <footer className="portal-footer admissions-footer"><div className="portal-footer-main"><Link to="/" className="portal-footer-brand"><span className="portal-crest"><GraduationCap size={22} /></span><span><strong>EDUTRACK SCHOOL</strong><small>Learning together, growing every day</small></span></Link><div><strong>Explore</strong><Link to="/">Home</Link><Link to="/#discover">Discover</Link><Link to="/admissions">Admissions</Link></div><div><strong>Student portal</strong><Link to="/login">Sign in</Link><Link to="/signup">Create an account</Link></div></div><div className="portal-footer-bottom"><span>© {new Date().getFullYear()} EduTrack School. All rights reserved.</span><span>Made for learning, built for community.</span></div></footer>
  </div>;
}
