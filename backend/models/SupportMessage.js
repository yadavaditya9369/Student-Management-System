import mongoose from 'mongoose';

const supportMessageSchema = new mongoose.Schema({
  type: { type: String, enum: ['help', 'contact', 'admissions'], required: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
  subject: { type: String, required: true, trim: true, maxlength: 160 },
  message: { type: String, required: true, trim: true, maxlength: 3000 },
  status: { type: String, enum: ['new', 'in-progress', 'resolved'], default: 'new' }
}, { timestamps: true });

export default mongoose.model('SupportMessage', supportMessageSchema);
