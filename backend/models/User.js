import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: false, select: false, minlength: 8 },
  role: { type: String, enum: ['admin', 'teacher', 'student'], default: 'admin' },
  oauthProviders: {
    google: { type: String, default: undefined },
    microsoft: { type: String, default: undefined },
    github: { type: String, default: undefined }
  }
}, { timestamps: true });

userSchema.index({ 'oauthProviders.google': 1 }, { unique: true, sparse: true });
userSchema.index({ 'oauthProviders.microsoft': 1 }, { unique: true, sparse: true });
userSchema.index({ 'oauthProviders.github': 1 }, { unique: true, sparse: true });

userSchema.pre('save', async function save(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userSchema);

