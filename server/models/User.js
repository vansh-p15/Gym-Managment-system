import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, trim: true, default: '' },
  role: { type: String, enum: ['member', 'trainer', 'admin'], default: 'member' },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  age: { type: Number, default: 0 },
  address: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  // Member-specific
  height: { type: Number, default: 0 },
  weight: { type: Number, default: 0 },
  emergencyContact: { type: String, default: '' },
  assignedTrainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  // Trainer-specific
  specialization: { type: String, default: '' },
  experience: { type: Number, default: 0 },
  certification: { type: String, default: '' },
  dailyRate: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
