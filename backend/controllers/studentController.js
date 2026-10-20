import Student from '../models/Student.js';

export async function listStudents(req, res) {
  const { search = '', course, semester, status, page = 1, limit = 10, sort = 'createdAt', order = 'desc' } = req.query;
  const filter = {};
  if (search) filter.$or = [{ fullName: new RegExp(search, 'i') }, { email: new RegExp(search, 'i') }, { studentId: new RegExp(search, 'i') }];
  if (course) filter.course = course;
  if (semester) filter.semester = semester;
  if (status) filter.status = status;
  const safeSort = ['createdAt', 'fullName', 'enrollmentDate', 'studentId'].includes(sort) ? sort : 'createdAt';
  const pageNumber = Math.max(Number(page), 1);
  const pageSize = Math.min(Math.max(Number(limit), 1), 100);
  const [students, total] = await Promise.all([
    Student.find(filter).select('-aadhaarNumber -profileImageUrl -signatureImageUrl').sort({ [safeSort]: order === 'asc' ? 1 : -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize),
    Student.countDocuments(filter)
  ]);
  res.json({ students, pagination: { page: pageNumber, limit: pageSize, total, pages: Math.ceil(total / pageSize) } });
}

export async function getStudent(req, res) {
  const student = await Student.findById(req.params.id).select('-aadhaarNumber');
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.json({ student });
}

export async function createStudent(req, res) {
  const student = await Student.create(req.body);
  const safeStudent = student.toObject();
  delete safeStudent.aadhaarNumber;
  res.status(201).json({ student: safeStudent });
}

export async function updateStudent(req, res) {
  const student = await Student.findById(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  Object.assign(student, req.body);
  await student.save();
  const safeStudent = student.toObject();
  delete safeStudent.aadhaarNumber;
  res.json({ student: safeStudent });
}

export async function deleteStudent(req, res) {
  const student = await Student.findByIdAndDelete(req.params.id);
  if (!student) return res.status(404).json({ message: 'Student not found' });
  res.status(204).send();
}

