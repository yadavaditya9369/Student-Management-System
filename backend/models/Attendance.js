import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  date: { type: Date, required: true },
  status: { type: String, enum: ['Present', 'Absent', 'Late'], required: true },
  verificationPhoto: { type: String, select: false, default: '' }
}, { timestamps: true });

attendanceSchema.index({ student: 1, date: 1 }, { unique: true });
export default mongoose.model('Attendance', attendanceSchema);

