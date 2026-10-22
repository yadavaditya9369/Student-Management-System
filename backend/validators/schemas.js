import { z } from 'zod';

const date = z.coerce.date();
export const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8), role: z.enum(['admin', 'teacher']).optional() });
export const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'teacher']).optional()
});
export const studentSchema = z.object({
  studentId: z.string().min(2).max(30).regex(/^[A-Za-z0-9 .$\/+%-]+$/, 'Student ID must use characters supported by the Code 39 barcode'),
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  aadhaarNumber: z.string().regex(/^\d{12}$/, 'Aadhaar number must contain exactly 12 digits'),
  aadhaarVerified: z.literal(true),
  dateOfBirth: date,
  gender: z.enum(['Male', 'Female', 'Other', '']).optional(),
  profileImageUrl: z.string().max(2_100_000).regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/).or(z.literal('')).optional(),
  signatureImageUrl: z.string().max(2_100_000).regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/).or(z.literal('')).optional(),
  course: z.string().min(2).max(100),
  semester: z.string().min(1).max(30),
  enrollmentDate: date,
  address: z.string().max(300).optional(),
  guardianName: z.string().max(120).optional(),
  guardianPhone: z.string().max(20).optional(),
  status: z.enum(['Active', 'Inactive', 'Graduated']).optional()
});
export const attendanceSchema = z.object({
  student: z.string().length(24),
  date,
  status: z.enum(['Present', 'Absent', 'Late']),
  verificationPhoto: z.string().max(2_100_000).regex(/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+=*$/).optional()
}).refine((record) => record.status !== 'Present' || Boolean(record.verificationPhoto), {
  message: 'A live verification photo is required to mark attendance present',
  path: ['verificationPhoto']
});
export const resultSchema = z.object({ student: z.string().length(24), subject: z.string().min(1), exam: z.string().min(1), marks: z.coerce.number().min(0), maxMarks: z.coerce.number().positive() });
export const resultImportSchema = z.array(resultSchema).min(1).max(40);
export const feeRecordSchema = z.object({
  student: z.string().length(24),
  category: z.enum(['academic', 'hostel', 'library', 'bus']),
  amount: z.coerce.number().positive().max(10_000_000),
  dueDate: date,
  period: z.string().trim().min(2).max(80)
});
export const feeStatusSchema = z.object({ status: z.enum(['Pending', 'Paid']) });
export const libraryBookSchema = z.object({
  title: z.string().trim().min(1).max(180),
  author: z.string().trim().min(1).max(120),
  category: z.string().trim().min(2).max(60),
  isbn: z.string().trim().max(20).optional().or(z.literal('')),
  totalCopies: z.coerce.number().int().min(1).max(10000),
  shelf: z.string().trim().max(40).optional().or(z.literal(''))
});
export const libraryCirculationSchema = z.object({ action: z.enum(['issue', 'return']) });
export const supportMessageSchema = z.object({
  type: z.enum(['help', 'contact', 'admissions']),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(3000)
});
