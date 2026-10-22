import mongoose from 'mongoose';

const libraryBookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 180 },
  author: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, required: true, trim: true, maxlength: 60, index: true },
  isbn: { type: String, trim: true, maxlength: 20, unique: true, sparse: true },
  totalCopies: { type: Number, required: true, min: 1 },
  availableCopies: { type: Number, required: true, min: 0 },
  shelf: { type: String, trim: true, maxlength: 40, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

libraryBookSchema.index({ title: 'text', author: 'text', isbn: 'text' });

export default mongoose.model('LibraryBook', libraryBookSchema);
