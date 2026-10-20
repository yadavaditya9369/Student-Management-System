import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowDownToLine, ArrowRight, BookOpen, Bus, Check, ChevronDown, CircleAlert, CircleCheck, Clock3, House, Library, Plus, Search, SlidersHorizontal, WalletCards, X } from 'lucide-react';
import toast from 'react-hot-toast';

const categories = [
  { id: 'academic', name: 'Academic fee', detail: 'Tuition, term and examination charges', icon: BookOpen, tone: 'academic', collected: 1840000, pending: 286000 },
  { id: 'hostel', name: 'Hostel fee', detail: 'Residence and mess charges', icon: House, tone: 'hostel', collected: 620000, pending: 94000 },
  { id: 'library', name: 'Library fee', detail: 'Membership and overdue charges', icon: Library, tone: 'library', collected: 110000, pending: 18500 },
  { id: 'bus', name: 'Bus fee', detail: 'Transport and route charges', icon: Bus, tone: 'bus', collected: 380000, pending: 76000 }
];

const initialFees = [
  { id: 'F-2501', name: 'Aarav Mehta', studentId: 'STU-2025-001', course: 'Grade 10 · A', category: 'academic', amount: 24000, dueDate: '2026-10-25', status: 'Pending' },
  { id: 'F-2502', name: 'Ananya Sharma', studentId: 'STU-2025-014', course: 'Grade 9 · B', category: 'hostel', amount: 18500, dueDate: '2026-10-28', status: 'Paid' },
  { id: 'F-2503', name: 'Kabir Singh', studentId: 'STU-2025-021', course: 'Grade 11 · A', category: 'bus', amount: 7200, dueDate: '2026-10-20', status: 'Overdue' },
  { id: 'F-2504', name: 'Diya Patel', studentId: 'STU-2025-027', course: 'Grade 10 · B', category: 'academic', amount: 24000, dueDate: '2026-10-25', status: 'Paid' },
  { id: 'F-2505', name: 'Vivaan Rao', studentId: 'STU-2025-036', course: 'Grade 8 · A', category: 'library', amount: 1200, dueDate: '2026-10-30', status: 'Pending' },
  { id: 'F-2506', name: 'Mira Kapoor', studentId: 'STU-2025-041', course: 'Grade 12 · C', category: 'hostel', amount: 18500, dueDate: '2026-10-19', status: 'Overdue' },
  { id: 'F-2507', name: 'Arjun Verma', studentId: 'STU-2025-053', course: 'Grade 9 · A', category: 'bus', amount: 7200, dueDate: '2026-10-22', status: 'Pending' },
  { id: 'F-2508', name: 'Sara Khan', studentId: 'STU-2025-065', course: 'Grade 11 · B', category: 'academic', amount: 24000, dueDate: '2026-10-18', status: 'Paid' }
];

const formatRupees = (amount) => `₹${Number(amount).toLocaleString('en-IN')}`;
const readFees = () => { try { return JSON.parse(localStorage.getItem('edutrack.admin.fees') || 'null') || initialFees; } catch { return initialFees; } };

export function Fees() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = categories.some(({ id }) => id === searchParams.get('category')) ? searchParams.get('category') : 'all';
  const [fees, setFees] = useState(readFees);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('All statuses');
  const visible = useMemo(() => fees.filter((fee) => (currentCategory === 'all' || fee.category === currentCategory) && (status === 'All statuses' || fee.status === status) && `${fee.name} ${fee.studentId} ${fee.id}`.toLowerCase().includes(search.toLowerCase())), [fees, currentCategory, status, search]);
  const active = categories.find(({ id }) => id === currentCategory);
  const updateStatus = (id) => { const next = fees.map((fee) => fee.id === id ? { ...fee, status: fee.status === 'Paid' ? 'Pending' : 'Paid' } : fee); setFees(next); localStorage.setItem('edutrack.admin.fees', JSON.stringify(next)); toast.success('Fee status updated in this browser'); };
  const selectCategory = (id) => setSearchParams(id === 'all' ? {} : { category: id });
  return <div className="admin-service-page">
    <div className="page-heading service-page-heading"><div><div className="eyebrow">SCHOOL FINANCE</div><h1>Fee management</h1><p className="muted">Review fee collections across tuition, residence, library and transport.</p></div><button className="service-secondary-button" onClick={() => toast('Export will be available when fee records are connected.', { icon: 'ℹ️' })}><ArrowDownToLine size={16} /> Export report</button></div>
    <section className="finance-summary-grid"><article><span className="finance-summary-icon collected"><WalletCards size={18} /></span><div><small>Collected this term</small><strong>₹24,86,000</strong><em><i /> Across all fee types</em></div></article><article><span className="finance-summary-icon pending"><Clock3 size={18} /></span><div><small>Pending collection</small><strong>₹4,74,500</strong><em>Needs follow-up</em></div></article><article><span className="finance-summary-icon overdue"><CircleAlert size={18} /></span><div><small>Overdue accounts</small><strong>28</strong><em>Across all year groups</em></div></article><article><span className="finance-summary-icon success"><CircleCheck size={18} /></span><div><small>Collection rate</small><strong>84%</strong><em>Current academic term</em></div></article></section>
    <div className="fee-category-grid">{categories.map(({ id, name, detail, icon: Icon, tone, collected, pending }) => <button key={id} className={`fee-category-card ${tone}${currentCategory === id ? ' selected' : ''}`} onClick={() => selectCategory(currentCategory === id ? 'all' : id)}><span className="fee-category-card-icon"><Icon size={18} /></span><span className="fee-category-card-copy"><strong>{name}</strong><small>{detail}</small><em>{formatRupees(collected)} collected <i /> {formatRupees(pending)} pending</em></span><ArrowRight size={15} /></button>)}</div>
    <section className="service-data-card"><div className="service-data-heading"><div><span className="finance-eyebrow"><WalletCards size={14} /> COLLECTION REGISTER</span><h2>{active ? active.name : 'All fee records'}</h2><p>{visible.length} student accounts in this view</p></div><div className="finance-data-note">Preview data · not connected to billing records</div></div><div className="service-table-toolbar"><label><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search student or receipt..." /></label><div><SlidersHorizontal size={15} /><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by fee status"><option>All statuses</option><option>Paid</option><option>Pending</option><option>Overdue</option></select><ChevronDown size={14} /></div></div><div className="service-table-scroll"><table className="service-table"><thead><tr><th>Student</th><th>Fee category</th><th>Receipt</th><th>Due date</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead><tbody>{visible.map((fee) => <tr key={fee.id}><td><strong>{fee.name}</strong><small>{fee.studentId} · {fee.course}</small></td><td>{categories.find(({ id }) => id === fee.category)?.name}</td><td>{fee.id}</td><td>{new Date(`${fee.dueDate}T00:00:00`).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</td><td><strong>{formatRupees(fee.amount)}</strong></td><td><span className={`finance-status ${fee.status.toLowerCase()}`}><i />{fee.status}</span></td><td><button className="fee-row-action" onClick={() => updateStatus(fee.id)}>{fee.status === 'Paid' ? 'Reopen' : 'Mark paid'}</button></td></tr>)}</tbody></table>{!visible.length && <div className="service-no-results">No fee records match these filters.</div>}</div><div className="service-table-foot"><span>Showing {visible.length} of {fees.length} preview records</span><span>Fee status changes save in this browser only.</span></div></section>
    <p className="service-preview-disclaimer">The amounts and student accounts shown here are sample data for the interface. Connect your fee ledger to show real balances and payment history.</p>
  </div>;
}

const libraryKey = 'edutrack.admin.library';
const sampleBooks = [
  { id: 'LIB-1024', title: 'A Brief History of Time', author: 'Stephen Hawking', category: 'Science', copies: 8, available: 5 },
  { id: 'LIB-1052', title: 'The Blue Umbrella', author: 'Ruskin Bond', category: 'Literature', copies: 12, available: 9 },
  { id: 'LIB-1110', title: 'Concepts of Physics · Vol 1', author: 'H. C. Verma', category: 'Physics', copies: 10, available: 3 },
  { id: 'LIB-1147', title: 'The Discovery of India', author: 'Jawaharlal Nehru', category: 'History', copies: 6, available: 4 },
  { id: 'LIB-1203', title: 'Wings of Fire', author: 'A. P. J. Abdul Kalam', category: 'Biography', copies: 9, available: 7 },
  { id: 'LIB-1261', title: 'Mathematics for Class X', author: 'R. D. Sharma', category: 'Mathematics', copies: 14, available: 2 }
];
const readBooks = () => { try { return JSON.parse(localStorage.getItem(libraryKey) || 'null') || sampleBooks; } catch { return sampleBooks; } };

export function LibraryPage() {
  const [books, setBooks] = useState(readBooks);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All categories');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', author: '', category: '', copies: '1' });
  const categoriesList = [...new Set(books.map((book) => book.category))];
  const visible = books.filter((book) => (category === 'All categories' || book.category === category) && `${book.title} ${book.author} ${book.id}`.toLowerCase().includes(search.toLowerCase()));
  const saveBooks = (next) => { setBooks(next); localStorage.setItem(libraryKey, JSON.stringify(next)); };
  const addBook = (event) => { event.preventDefault(); const copies = Number(form.copies); saveBooks([{ id: `LIB-${Math.floor(1300 + Math.random() * 7000)}`, ...form, copies, available: copies }, ...books]); setForm({ title: '', author: '', category: '', copies: '1' }); setShowForm(false); toast.success('Book added to the library catalogue'); };
  const updateCopies = (book) => { if (book.available === 0) { toast.error('No copies are available to issue'); return; } const next = books.map((item) => item.id === book.id ? { ...item, available: item.available - 1 } : item); saveBooks(next); toast.success('One copy marked as issued'); };
  const returnCopy = (book) => { const next = books.map((item) => item.id === book.id ? { ...item, available: Math.min(item.copies, item.available + 1) } : item); saveBooks(next); toast.success('Copy returned to the catalogue'); };
  const totalCopies = books.reduce((sum, book) => sum + book.copies, 0);
  const availableCopies = books.reduce((sum, book) => sum + book.available, 0);
  return <div className="admin-service-page library-page">
    <div className="page-heading service-page-heading"><div><div className="eyebrow">LEARNING RESOURCES</div><h1>Library</h1><p className="muted">Manage the school catalogue and keep track of available copies.</p></div><button className="service-primary-button" onClick={() => setShowForm(!showForm)}><Plus size={16} /> Add a book</button></div>
    <section className="library-welcome"><div><span>THE SCHOOL LIBRARY</span><h2>A little more room<br />to explore.</h2><p>Keep learning resources easy to find, borrow and return.</p></div><div className="library-welcome-illustration"><Library size={36} /><span /><span /><span /></div></section>
    <section className="library-stats-grid"><article><span className="lib-stat-icon blue"><BookOpen size={18} /></span><div><small>Titles in catalogue</small><strong>{books.length}</strong><em>Across {categoriesList.length} categories</em></div></article><article><span className="lib-stat-icon green"><CircleCheck size={18} /></span><div><small>Available copies</small><strong>{availableCopies}</strong><em>Ready to issue</em></div></article><article><span className="lib-stat-icon violet"><WalletCards size={18} /></span><div><small>Total book copies</small><strong>{totalCopies}</strong><em>Current library stock</em></div></article><article><span className="lib-stat-icon amber"><Clock3 size={18} /></span><div><small>Issued copies</small><strong>{totalCopies - availableCopies}</strong><em>Marked as borrowed</em></div></article></section>
    {showForm && <form className="library-add-form" onSubmit={addBook}><div className="library-form-heading"><div><span className="finance-eyebrow"><Plus size={14} /> NEW CATALOGUE ITEM</span><h2>Add a book</h2></div><button className="library-close" type="button" onClick={() => setShowForm(false)} aria-label="Close"><X size={18} /></button></div><div className="library-form-grid"><label>Book title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Title" /></label><label>Author<input required value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} placeholder="Author name" /></label><label>Category<input required value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="e.g. Science" /></label><label>Copies<input type="number" min="1" max="999" required value={form.copies} onChange={(event) => setForm({ ...form, copies: event.target.value })} /></label></div><button className="service-primary-button" type="submit"><Check size={15} /> Add to catalogue</button></form>}
    <section className="service-data-card"><div className="service-data-heading"><div><span className="finance-eyebrow"><Library size={14} /> CATALOGUE</span><h2>Books and resources</h2><p>{visible.length} titles in this view</p></div><div className="finance-data-note">Catalogue changes save in this browser</div></div><div className="service-table-toolbar"><label><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, author or ID..." /></label><div><SlidersHorizontal size={15} /><select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category"><option>All categories</option>{categoriesList.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></div></div><div className="service-table-scroll"><table className="service-table library-table"><thead><tr><th>Book title</th><th>Author</th><th>Category</th><th>Book ID</th><th>Copies</th><th>Availability</th><th>Circulation</th></tr></thead><tbody>{visible.map((book) => <tr key={book.id}><td><strong>{book.title}</strong></td><td>{book.author}</td><td><span className="library-category-chip">{book.category}</span></td><td>{book.id}</td><td>{book.copies}</td><td><span className={`book-availability${book.available === 0 ? ' none' : ''}`}><i />{book.available} available</span></td><td><button className="book-circulation-action" onClick={() => updateCopies(book)} disabled={book.available === 0}>Issue copy</button><button className="book-return-action" onClick={() => returnCopy(book)} disabled={book.available === book.copies}>Return</button></td></tr>)}</tbody></table>{!visible.length && <div className="service-no-results">No books match this search.</div>}</div><div className="service-table-foot"><span>{visible.length} titles · {totalCopies} copies total</span><span>Sample catalogue for interface preview.</span></div></section>
    <p className="service-preview-disclaimer">Library catalogue and circulation changes are saved in this browser. Connect a shared library service to sync books and borrowing records across staff devices.</p>
  </div>;
}
