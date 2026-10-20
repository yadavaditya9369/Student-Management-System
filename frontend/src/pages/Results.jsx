import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, FileText, Plus, Sparkles, Trash2, TrendingUp, UploadCloud } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import toast from 'react-hot-toast';
import api from '../services/api';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const maxImageFileSize = 10 * 1024 * 1024;
const maxPdfFileSize = 20 * 1024 * 1024;

function extractSubjects(ocrText) {
  const rows = [];
  const seen = new Set();
  const patterns = [
    /^([A-Za-z][A-Za-z0-9 &'().\/-]{1,45}?)\s+(\d{1,3}(?:\.\d+)?)\s*(?:\/|of)\s*(\d{1,3}(?:\.\d+)?)\s*$/i,
    /^([A-Za-z][A-Za-z0-9 &'().\/-]{1,45}?)\s+(\d{1,3}(?:\.\d+)?)\s+(\d{1,3}(?:\.\d+)?)\s*$/i
  ];
  for (const rawLine of ocrText.split(/\r?\n/)) {
    const line = rawLine.replace(/[|]/g, ' ').replace(/\s+/g, ' ').trim();
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (!match) continue;
      const subject = match[1].trim().replace(/\s+/g, ' ');
      const key = subject.toLowerCase();
      const marks = Number(match[2]);
      const maxMarks = Number(match[3]);
      if (/^(total|grand total|percentage|percent|result|rank|roll no|attendance)$/i.test(subject) || !maxMarks || marks > maxMarks || seen.has(key)) break;
      rows.push({ key: `${Date.now()}-${rows.length}`, subject, marks, maxMarks });
      seen.add(key);
      break;
    }
  }
  return rows;
}

function recommendation(percentage) {
  if (percentage < 40) return { label: 'Priority focus', text: 'Revisit core concepts with guided examples, then solve a short set of basic questions each day.', tone: 'urgent' };
  if (percentage < 60) return { label: 'Needs practice', text: 'Review mistakes by topic and do 20–30 minutes of targeted practice before a timed quiz.', tone: 'focus' };
  if (percentage < 80) return { label: 'Build consistency', text: 'Use mixed, timed practice and keep a weekly error log to strengthen accuracy.', tone: 'steady' };
  return { label: 'Maintain strength', text: 'Keep up spaced revision and challenge yourself with advanced or application questions.', tone: 'strong' };
}

export default function Results() {
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [exam, setExam] = useState('');
  const [file, setFile] = useState(null);
  const [items, setItems] = useState([]);
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrProgress, setOcrProgress] = useState('');
  const [saving, setSaving] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const load = () => Promise.all([
    api.get('/students', { params: { limit: 100, status: 'Active' } }),
    api.get('/results')
  ]).then(([studentResponse, resultResponse]) => {
    setStudents(studentResponse.data.students);
    setResults(resultResponse.data.results);
  }).catch(() => toast.error('Could not load examination data'));
  useEffect(() => { load(); }, []);

  const summary = useMemo(() => {
    if (!items.length) return null;
    const analyzed = items.map((item) => ({ ...item, percentage: Math.round((Number(item.marks) / Number(item.maxMarks)) * 100) }));
    const average = Math.round(analyzed.reduce((sum, item) => sum + item.percentage, 0) / analyzed.length);
    return { rows: analyzed, average, strongest: [...analyzed].sort((a, b) => b.percentage - a.percentage)[0], needsFocus: [...analyzed].sort((a, b) => a.percentage - b.percentage)[0] };
  }, [items]);

  const chooseFile = (event) => {
    const selected = event.target.files?.[0] || null;
    if (!selected) return;
    const isPdf = selected.type === 'application/pdf' || selected.name.toLowerCase().endsWith('.pdf');
    if (!(isPdf || ['image/jpeg', 'image/png', 'image/webp'].includes(selected.type))) {
      toast.error('Upload a JPG, PNG, WebP, or PDF mark sheet');
      event.target.value = '';
      return;
    }
    if (selected.size > (isPdf ? maxPdfFileSize : maxImageFileSize)) {
      toast.error(isPdf ? 'PDF must be 20 MB or smaller' : 'Image must be 10 MB or smaller');
      event.target.value = '';
      return;
    }
    setFile(selected);
    setItems([]);
    setAnalysis(null);
  };

  const analyzeUpload = async () => {
    if (!studentId || !exam.trim() || !file) {
      toast.error('Select a student, enter the exam name, and upload a mark sheet');
      return;
    }
    setOcrBusy(true);
    setOcrProgress('Starting text recognition…');
    let worker;
    try {
      worker = await createWorker('eng', 1, { logger: (message) => {
        if (message.status === 'recognizing text') setOcrProgress(`Reading marks… ${Math.round(message.progress * 100)}%`);
        else setOcrProgress('Preparing English text recognition…');
      } });
      let text = '';
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const pdf = await getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
        const pageCount = Math.min(pdf.numPages, 5);
        if (pdf.numPages > pageCount) toast('Only the first 5 PDF pages will be analyzed');
        for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
          setOcrProgress(`Rendering PDF page ${pageNumber} of ${pageCount}…`);
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale: 1.6 });
          const canvas = document.createElement('canvas');
          canvas.width = Math.ceil(viewport.width);
          canvas.height = Math.ceil(viewport.height);
          await page.render({ canvas, canvasContext: canvas.getContext('2d'), viewport }).promise;
          const result = await worker.recognize(canvas);
          text += `\n${result.data.text}`;
          canvas.width = 0;
          canvas.height = 0;
        }
        await pdf.destroy();
      } else {
        const result = await worker.recognize(file);
        text = result.data.text;
      }
      const extracted = extractSubjects(text);
      setItems(extracted);
      setAnalysis(null);
      if (extracted.length) toast.success(`Found ${extracted.length} possible subject scores. Review them before saving.`);
      else toast.error('Could not find subject marks. Try a clearer image or add the subjects manually.');
    } catch (error) {
      toast.error(error.message || 'Could not analyze this mark sheet');
    } finally {
      await worker?.terminate();
      setOcrBusy(false);
      setOcrProgress('');
    }
  };

  const updateItem = (key, field, value) => { setAnalysis(null); setItems((current) => current.map((item) => item.key === key ? { ...item, [field]: value } : item)); };
  const addItem = () => { setAnalysis(null); setItems((current) => [...current, { key: `${Date.now()}-${Math.random()}`, subject: '', marks: '', maxMarks: 100 }]); };
  const saveAndAnalyze = async () => {
    const invalid = items.some((item) => !item.subject.trim() || item.marks === '' || item.maxMarks === '' || Number(item.marks) < 0 || Number(item.maxMarks) <= 0 || Number(item.marks) > Number(item.maxMarks));
    if (!studentId || !exam.trim()) return toast.error('Select a student and enter an exam name');
    if (!items.length || invalid) return toast.error('Review every subject and enter valid marks before saving');
    setSaving(true);
    try {
      const payload = items.map(({ subject, marks, maxMarks }) => ({ student: studentId, subject: subject.trim(), exam: exam.trim(), marks: Number(marks), maxMarks: Number(maxMarks) }));
      await api.post('/results/import', payload);
      setAnalysis({ studentId, exam: exam.trim() });
      toast.success('Marks saved and preparation chart generated');
      await load();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Could not save these marks');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this result?')) return;
    try { await api.delete(`/results/${id}`); await load(); toast.success('Result deleted'); }
    catch (error) { toast.error(error.response?.data?.message || 'Could not delete result'); }
  };

  const analyzedStudent = students.find((student) => student._id === analysis?.studentId);

  return <>
    <div className="page-heading"><div><div className="eyebrow">ACADEMIC PERFORMANCE</div><h1>Marksheet analysis</h1><p className="muted">Upload a marksheet to review subject scores and create a focused preparation plan.</p></div></div>

    <section className="panel marksheet-panel">
      <div className="panel-heading"><div><h2>Upload marksheet</h2><p className="muted">We’ll read possible subject scores from a photo or PDF. Review all extracted values before saving.</p></div><FileText size={21} className="marksheet-icon" /></div>
      <div className="marksheet-controls">
        <label>Student<select value={studentId} onChange={(event) => { setStudentId(event.target.value); setItems([]); setAnalysis(null); }}><option value="">Select student</option>{students.map((student) => <option key={student._id} value={student._id}>{student.fullName} ({student.studentId})</option>)}</select></label>
        <label>Exam name<input value={exam} onChange={(event) => { setExam(event.target.value); setItems([]); setAnalysis(null); }} placeholder="e.g. Term 1 Examination" /></label>
        <label className="marksheet-file-label">Marksheet file<input type="file" accept="image/jpeg,image/png,image/webp,application/pdf,.pdf" onChange={chooseFile} /><span className="file-hint">JPG, PNG, WebP up to 10 MB · PDF up to 20 MB</span></label>
      </div>
      {file && <div className="selected-file"><FileText size={17} /><span><strong>{file.name}</strong><small>{(file.size / (1024 * 1024)).toFixed(2)} MB</small></span><button type="button" className="text-button" onClick={() => { setFile(null); setItems([]); setAnalysis(null); }}>Remove</button></div>}
      <div className="marksheet-actions"><button className="primary-button" disabled={ocrBusy || !file || !students.length} onClick={analyzeUpload}><UploadCloud size={17} />{ocrBusy ? 'Analyzing…' : 'Analyze marksheet'}</button>{ocrBusy && <span className="muted">{ocrProgress}</span>}</div>
      {file && !ocrBusy && items.length === 0 && <button className="manual-fallback" type="button" onClick={addItem}><Plus size={15} /> Enter subjects manually if OCR could not read this scan</button>}
      <p className="marksheet-privacy">Marks are read in your browser. The English OCR engine and language model may download from their provider on first use; the marksheet file itself is not sent to an OCR server.</p>
    </section>

    {items.length > 0 && <section className="panel extracted-panel"><div className="panel-heading"><div><h2>Review extracted marks</h2><p className="muted">OCR may misread digits. Correct the subjects and scores below before saving.</p></div><button className="secondary-button" type="button" onClick={addItem}><Plus size={15} /> Add subject</button></div><div className="extracted-table-wrap"><table className="extracted-table"><thead><tr><th>Subject</th><th>Marks</th><th>Out of</th><th>Score</th><th /></tr></thead><tbody>{items.map((item) => <tr key={item.key}><td><input value={item.subject} aria-label="Subject" onChange={(event) => updateItem(item.key, 'subject', event.target.value)} /></td><td><input type="number" min="0" value={item.marks} aria-label="Marks scored" onChange={(event) => updateItem(item.key, 'marks', event.target.value)} /></td><td><input type="number" min="1" value={item.maxMarks} aria-label="Maximum marks" onChange={(event) => updateItem(item.key, 'maxMarks', event.target.value)} /></td><td>{Number(item.maxMarks) > 0 && item.marks !== '' ? `${Math.round(Number(item.marks) / Number(item.maxMarks) * 100)}%` : '—'}</td><td><button className="danger-icon" aria-label={`Remove ${item.subject || 'subject'}`} onClick={() => setItems((current) => current.filter((row) => row.key !== item.key))}><Trash2 size={16} /></button></td></tr>)}</tbody></table></div><div className="save-analysis-row"><span className="muted">{items.length} subject{items.length === 1 ? '' : 's'} ready for analysis</span><button className="primary-button" disabled={saving} onClick={saveAndAnalyze}><Sparkles size={16} />{saving ? 'Saving…' : 'Save marks & build chart'}</button></div></section>}

    {analysis && summary && <section className="panel prep-panel"><div className="panel-heading"><div><div className="eyebrow">PERSONALIZED PREPARATION PLAN</div><h2>{analyzedStudent?.fullName} · {analysis.exam}</h2><p className="muted">Use this chart to decide where to spend your next study sessions.</p></div><div className="average-score"><strong>{summary.average}%</strong><span>Average</span></div></div><div className="prep-chart">{summary.rows.map((row) => { const advice = recommendation(row.percentage); return <article className="prep-row" key={row.key}><div className="prep-row-top"><strong>{row.subject}</strong><span>{row.marks}/{row.maxMarks} · {row.percentage}%</span></div><div className="prep-track"><div className={`prep-bar ${advice.tone}`} style={{ width: `${Math.max(3, row.percentage)}%` }} /></div><div className={`prep-advice ${advice.tone}`}><strong>{advice.label}</strong><span>{advice.text}</span></div></article>; })}</div><div className="prep-highlights"><div><TrendingUp size={17} /><span>Strongest area<strong>{summary.strongest.subject} · {summary.strongest.percentage}%</strong></span></div><div className="focus-highlight"><AlertTriangle size={17} /><span>First focus area<strong>{summary.needsFocus.subject} · {summary.needsFocus.percentage}%</strong></span></div></div><p className="prep-footnote">Preparation suggestions are based on marks only. Review the original marksheet and discuss learning needs with the student or teacher.</p></section>}

    <section className="panel table-panel results-history"><div className="panel-heading"><div><h2>Latest results</h2><p className="muted">{results.length} recorded subject scores</p></div></div>{results.length ? <div className="table-scroll"><table><thead><tr><th>Student</th><th>Subject</th><th>Exam</th><th>Score</th><th>Grade</th><th /></tr></thead><tbody>{results.map((result) => { const percentage = Math.round(result.marks / result.maxMarks * 100); return <tr key={result._id}><td><strong>{result.student?.fullName}</strong><small className="block">{result.student?.studentId}</small></td><td>{result.subject}</td><td>{result.exam}</td><td>{result.marks} / {result.maxMarks}</td><td><span className={`grade grade-${percentage >= 80 ? 'a' : percentage >= 60 ? 'b' : 'c'}`}>{percentage}%</span></td><td><button className="danger-icon" onClick={() => remove(result._id)}><Trash2 size={16} /></button></td></tr>; })}</tbody></table></div> : <p className="muted empty-inline">No results yet. Upload and analyze a marksheet to get started.</p>}</section>
  </>;
}
