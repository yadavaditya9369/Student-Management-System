import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Eye, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import Loader from '../components/common/Loader';
import EmptyState from '../components/common/EmptyState';
import { readPreferences } from '../utils/preferences';

export default function Students() {
  const [data, setData] = useState(null); const [query, setQuery] = useState(''); const [page, setPage] = useState(1);
  const load = () => api.get('/students', { params: { search: query, page, limit: readPreferences().studentPageSize } }).then(({ data: result }) => setData(result));
  useEffect(() => { load(); }, [page]); useEffect(() => { const timer = setTimeout(() => { setPage(1); load(); }, 300); return () => clearTimeout(timer); }, [query]);
  const remove = async (id) => { if (readPreferences().confirmDeletes && !window.confirm('Delete this student and their profile?')) return; try { await api.delete(`/students/${id}`); toast.success('Student deleted'); load(); } catch (error) { toast.error(error.response?.data?.message || 'Could not delete student'); } };
  if (!data) return <Loader />;
  return <><div className="page-heading"><div><div className="eyebrow">DIRECTORY</div><h1>Students</h1><p className="muted">Manage student records and enrollment information.</p></div><Link className="primary-button" to="/students/new"><Plus size={17} /> Add student</Link></div><section className="panel table-panel"><div className="table-toolbar"><div className="search-field"><Search size={17} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, email or ID..." /></div><select><option>All courses</option></select><select><option>All statuses</option></select></div>{data.students.length ? <><div className="table-scroll"><table><thead><tr><th>Student</th><th>Student ID</th><th>Course</th><th>Semester</th><th>Status</th><th>Actions</th></tr></thead><tbody>{data.students.map((student) => <tr key={student._id}><td><div className="table-student"><div className="student-avatar">{student.fullName.charAt(0)}</div><div><strong>{student.fullName}</strong><small>{student.email}</small></div></div></td><td className="mono">{student.studentId}</td><td>{student.course}</td><td>{student.semester}</td><td><span className={`status-pill ${student.status.toLowerCase()}`}>{student.status}</span></td><td><div className="row-actions"><Link to={`/students/${student._id}/card`} title="Student ID card"><CreditCard size={16} /></Link><Link to={`/students/${student._id}/edit`} title="Edit"><Pencil size={16} /></Link><button onClick={() => remove(student._id)} title="Delete"><Trash2 size={16} /></button></div></td></tr>)}</tbody></table></div><div className="pagination"><span>Showing {data.students.length} of {data.pagination.total} students</span><div><button disabled={page === 1} onClick={() => setPage(page - 1)}><ChevronLeft size={16} /></button><b>{page}</b><button disabled={page >= data.pagination.pages} onClick={() => setPage(page + 1)}><ChevronRight size={16} /></button></div></div></> : <EmptyState title="No students found" text="Try changing your search or add your first student." />}</section></>;
}

