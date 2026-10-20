import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import FacultyLayout from './components/layout/FacultyLayout';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Admissions from './pages/Admissions';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentForm from './pages/StudentForm';
import StudentIdCard from './pages/StudentIdCard';
import Attendance from './pages/Attendance';
import Results from './pages/Results';
import { Fees, LibraryPage } from './pages/AdminServices';
import { Settings, NotFound } from './pages/SimplePages';
import { FacultyDashboard, FacultyAssignments, FacultyGallery, FacultyTimetable } from './pages/FacultyWorkspace';
import './index.css';

export default function App() {
  return <BrowserRouter><AuthProvider><Toaster position="top-right" /><Routes><Route path="/" element={<Landing />} /><Route path="/landing" element={<Landing />} /><Route path="/admissions" element={<Admissions />} /><Route path="/login" element={<Login />} /><Route path="/signup" element={<Login mode="signup" />} /><Route path="/admin/sign-in" element={<Login accountType="admin" />} /><Route path="/admin/sign-up" element={<Login mode="signup" accountType="admin" />} /><Route path="/faculty/sign-in" element={<Login accountType="teacher" />} /><Route path="/faculty/sign-up" element={<Login mode="signup" accountType="teacher" />} /><Route element={<ProtectedRoute role="admin" />}><Route path="/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} /><Route path="/students" element={<AdminLayout><Students /></AdminLayout>} /><Route path="/students/new" element={<AdminLayout><StudentForm /></AdminLayout>} /><Route path="/students/:id/card" element={<AdminLayout><StudentIdCard /></AdminLayout>} /><Route path="/students/:id/edit" element={<AdminLayout><StudentForm /></AdminLayout>} /><Route path="/attendance" element={<AdminLayout><Attendance /></AdminLayout>} /><Route path="/results" element={<AdminLayout><Results /></AdminLayout>} /><Route path="/fees" element={<AdminLayout><Fees /></AdminLayout>} /><Route path="/library" element={<AdminLayout><LibraryPage /></AdminLayout>} /><Route path="/settings" element={<AdminLayout><Settings /></AdminLayout>} /></Route><Route element={<ProtectedRoute role="teacher" />}><Route path="/faculty/dashboard" element={<FacultyLayout><FacultyDashboard /></FacultyLayout>} /><Route path="/faculty/assignments" element={<FacultyLayout><FacultyAssignments /></FacultyLayout>} /><Route path="/faculty/gallery" element={<FacultyLayout><FacultyGallery /></FacultyLayout>} /><Route path="/faculty/timetable" element={<FacultyLayout><FacultyTimetable /></FacultyLayout>} /></Route><Route path="*" element={<NotFound />} /></Routes></AuthProvider></BrowserRouter>;
}
