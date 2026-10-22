import mongoose from 'mongoose';

const feeRecordSchema = new mongoose.Schema({
  receiptNumber: { type: String, required: true, unique: true, trim: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
  category: { type: String, enum: ['academic', 'hostel', 'library', 'bus'], required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  dueDate: { type: Date, required: true, index: true },
  period: { type: String, required: true, trim: true, maxlength: 80 },
  status: { type: String, enum: ['Pending', 'Paid', 'Overdue'], default: 'Pending', index: true },
  paidAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

feeRecordSchema.index({ category: 1, status: 1, dueDate: 1 });

export default mongoose.model('FeeRecord', feeRecordSchema);
