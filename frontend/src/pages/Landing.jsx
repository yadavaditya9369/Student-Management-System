import { Link } from 'react-router-dom';
import { BookOpen, GraduationCap, HeartHandshake, LifeBuoy, Send, ShieldCheck, Users } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Login from './Login';

export default function Landing() {
  const [busy, setBusy] = useState('');
  const submitSupport = async (type, event) => {
    event.preventDefault();
    setBusy(type);
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    try {
      const { data } = await api.post('/support', { ...values, type });
      toast.success(data.message);
      form.reset();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not send your message. Please try again.');
    } finally { setBusy(''); }
  };
  return <div className="school-portal">
    <header className="portal-header">
      <Link to="/" className="portal-school-brand"><span className="portal-crest"><GraduationCap size={25} /></span><span><strong>EDUTRACK SCHOOL</strong><small>Learning together, growing every day</small></span></Link>
      <nav><a href="#home">Home</a><a href="#discover">Discover</a><Link to="/admissions">Admissions</Link><a href="#admissions">Contact Us</a></nav>
    </header>
    <main className="portal-main" id="home"><div className="portal-shade" /><div className="portal-welcome"><span>WELCOME TO</span><h1>A place to learn,<br />grow and belong.</h1><p>Supporting every student on the journey to a brighter future.</p></div><section className="portal-login-card"><Login portal /></section></main>
    <section className="portal-discover-section" id="discover" aria-label="Discover our school">
      <div className="portal-section-heading"><span>DISCOVER OUR SCHOOL</span><h2>Curiosity today.<br />Confidence for life.</h2><p>School is more than lessons. It’s a place to explore new ideas, find your strengths and build friendships that help you thrive.</p><p className="portal-discover-detail">Our learning community supports students in the classroom and beyond, with a focus on knowledge, kindness and personal growth.</p></div>
      <div className="portal-value-grid">
        <article><img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=760&q=85" alt="Students learning together in a classroom" /><div className="portal-value-copy"><span><BookOpen size={21} /></span><h3>Learning with purpose</h3><p>Build knowledge, curiosity and confidence through a supportive learning community.</p></div></article>
        <article><img src="https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&w=760&q=85" alt="Students studying together" /><div className="portal-value-copy"><span><HeartHandshake size={21} /></span><h3>Growing together</h3><p>Students are encouraged to discover their strengths and care for one another.</p></div></article>
        <article><img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=760&q=85" alt="Student taking part in a classroom activity" /><div className="portal-value-copy"><span><ShieldCheck size={21} /></span><h3>A safe community</h3><p>A welcoming environment helps every learner feel respected, included and ready to thrive.</p></div></article>
        <article><img src="https://images.unsplash.com/photo-1529390079861-591de354faf5?auto=format&fit=crop&w=760&q=85" alt="Students sharing a moment at school" /><div className="portal-value-copy"><span><Users size={21} /></span><h3>About our school</h3><p>We bring students, families and teachers together to create a place where everyone can learn and belong.</p></div></article>
      </div>
    </section>
    <section className="portal-support-section" id="admissions"><div className="portal-support-intro"><span>WE’RE HERE TO HELP</span><h2>Questions or need a hand?</h2><p>Send our school team a message. Choose the form that best fits what you need, and we’ll follow up by email.</p></div><div className="portal-support-grid">
      <form className="portal-support-form" onSubmit={(event) => submitSupport('help', event)}><div className="portal-form-heading"><span><LifeBuoy size={20} /></span><div><h3>Get help</h3><p>Ask for help with your account or portal access.</p></div></div><label>Your name<input name="name" required minLength="2" maxLength="120" placeholder="Full name" /></label><label>Email address<input name="email" required type="email" maxLength="254" placeholder="you@example.com" /></label><label>What do you need help with?<input name="subject" required minLength="3" maxLength="160" placeholder="e.g. I can’t sign in" /></label><label>Details<textarea name="message" required minLength="10" maxLength="3000" rows="4" placeholder="Tell us what happened and how we can help" /></label><button disabled={busy !== ''}>{busy === 'help' ? 'Sending…' : 'Send help request'} <Send size={15} /></button></form>
      <form className="portal-support-form" onSubmit={(event) => submitSupport('contact', event)}><div className="portal-form-heading"><span><Send size={19} /></span><div><h3>Contact the school</h3><p>Share a question, suggestion or general message.</p></div></div><label>Your name<input name="name" required minLength="2" maxLength="120" placeholder="Full name" /></label><label>Email address<input name="email" required type="email" maxLength="254" placeholder="you@example.com" /></label><label>Subject<input name="subject" required minLength="3" maxLength="160" placeholder="How can we help?" /></label><label>Your message<textarea name="message" required minLength="10" maxLength="3000" rows="4" placeholder="Write your message here" /></label><button disabled={busy !== ''}>{busy === 'contact' ? 'Sending…' : 'Send message'} <Send size={15} /></button></form>
    </div></section>
    <footer className="portal-footer" id="contact"><div className="portal-footer-main"><Link to="/" className="portal-footer-brand"><span className="portal-crest"><GraduationCap size={22} /></span><span><strong>EDUTRACK SCHOOL</strong><small>Learning together, growing every day</small></span></Link><div><strong>Explore</strong><a href="#home">Home</a><a href="#discover">Discover</a><a href="#admissions">Help &amp; Contact</a></div><div><strong>Get in touch</strong><a href="#admissions">Contact the school</a><Link to="/login">Student portal</Link><Link to="/signup">Create an account</Link></div></div><div className="portal-footer-bottom"><span>© {new Date().getFullYear()} EduTrack School. All rights reserved.</span><span>Made for learning, built for community.</span></div></footer>
  </div>;
}
