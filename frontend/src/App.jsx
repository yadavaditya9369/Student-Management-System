import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminLayout from './components/layout/AdminLayout';
import Login from './pages/Login';
import Landing from './pages/Landing';
import Admissions from './pages/Admissions';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import StudentForm from './pages/StudentForm';
import StudentIdCard from './pages/StudentIdCard';
import Attendance from './pages/Attendance';
import Results from './pages/Results';
import { Settings, NotFound } from './pages/SimplePages';
import './index.css';

export default function App() {
  return <BrowserRouter><AuthProvider><Toaster position="top-right" /><Routes><Route path="/" element={<Landing />} /><Route path="/landing" element={<Landing />} /><Route path="/admissions" element={<Admissions />} /><Route path="/login" element={<Login />} /><Route path="/signup" element={<Login mode="signup" />} /><Route element={<ProtectedRoute />}><Route path="/dashboard" element={<AdminLayout><Dashboard /></AdminLayout>} /><Route path="/students" element={<AdminLayout><Students /></AdminLayout>} /><Route path="/students/new" element={<AdminLayout><StudentForm /></AdminLayout>} /><Route path="/students/:id/card" element={<AdminLayout><StudentIdCard /></AdminLayout>} /><Route path="/students/:id/edit" element={<AdminLayout><StudentForm /></AdminLayout>} /><Route path="/attendance" element={<AdminLayout><Attendance /></AdminLayout>} /><Route path="/results" element={<AdminLayout><Results /></AdminLayout>} /><Route path="/settings" element={<AdminLayout><Settings /></AdminLayout>} /></Route><Route path="*" element={<NotFound />} /></Routes></AuthProvider></BrowserRouter>;
}
