import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  checkIn: { type: String, default: null },
  checkOut: { type: String, default: null },
  status: { type: String, enum: ['present', 'absent'], default: 'present' },
}, { timestamps: true });

attendanceSchema.index({ member: 1, date: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
