import { z } from 'zod';

const date = z.coerce.date();
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8)
});
export const studentSchema = z.object({
  studentId: z.string().min(2).max(30),
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  dateOfBirth: date,
  gender: z.enum(['Male', 'Female', 'Other', '']).optional(),
  profileImageUrl: z.string().url().or(z.literal('')).optional(),
  course: z.string().min(2).max(100),
  semester: z.string().min(1).max(30),
  enrollmentDate: date,
  address: z.string().max(300).optional(),
  guardianName: z.string().max(120).optional(),
  guardianPhone: z.string().max(20).optional(),
  status: z.enum(['Active', 'Inactive', 'Graduated']).optional()
});
export const attendanceSchema = z.object({ student: z.string().length(24), date, status: z.enum(['Present', 'Absent', 'Late']) });
export const resultSchema = z.object({ student: z.string().length(24), subject: z.string().min(1), exam: z.string().min(1), marks: z.coerce.number().min(0), maxMarks: z.coerce.number().positive() });
export const supportMessageSchema = z.object({
  type: z.enum(['help', 'contact', 'admissions']),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(3000)
});
