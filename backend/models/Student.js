import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  studentId: { type: String, required: true, unique: true, uppercase: true, trim: true },
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  aadhaarNumber: { type: String, required: true, match: /^\d{12}$/ },
  aadhaarVerified: { type: Boolean, required: true, default: false },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other', ''] },
  profileImageUrl: { type: String, default: '' },
  signatureImageUrl: { type: String, default: '' },
  course: { type: String, required: true, trim: true },
  semester: { type: String, required: true, trim: true },
  enrollmentDate: { type: Date, required: true },
  address: { type: String, default: '' },
  guardianName: { type: String, default: '' },
  guardianPhone: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive', 'Graduated'], default: 'Active' }
}, { timestamps: true });

export default mongoose.model('Student', studentSchema);

