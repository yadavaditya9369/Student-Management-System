import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';

export async function listAttendance(req, res) {
  const filter = {};
  if (req.query.date) {
    const start = new Date(req.query.date); const end = new Date(start); end.setDate(end.getDate() + 1);
    filter.date = { $gte: start, $lt: end };
  }
  if (req.query.student) filter.student = req.query.student;
  const records = await Attendance.find(filter).select('+verificationPhoto').populate('student', 'fullName studentId course').sort({ date: -1 });
  res.json({ records: records.map((record) => {
    const safeRecord = record.toObject();
    safeRecord.verificationCaptured = Boolean(safeRecord.verificationPhoto);
    delete safeRecord.verificationPhoto;
    return safeRecord;
  }) });
}

export async function upsertAttendance(req, res) {
  const student = await Student.findById(req.body.student).select('_id status');
  if (!student) return res.status(404).json({ message: 'Register this student before marking attendance' });
  if (student.status !== 'Active') return res.status(409).json({ message: 'Only active registered students can be marked present' });
  const attendanceData = { ...req.body };
  if (attendanceData.status !== 'Present') attendanceData.verificationPhoto = '';
  const record = await Attendance.findOneAndUpdate({ student: req.body.student, date: req.body.date }, attendanceData, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }).select('-verificationPhoto').populate('student', 'fullName studentId');
  res.status(200).json({ record });
}

