import mongoose from 'mongoose';

const trainerAttendanceSchema = new mongoose.Schema({
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  checkIn: { type: String, default: null },
  checkOut: { type: String, default: null },
  status: { type: String, enum: ['present', 'absent'], default: 'present' },
}, { timestamps: true });

trainerAttendanceSchema.index({ trainer: 1, date: 1 }, { unique: true });

const TrainerAttendance = mongoose.model('TrainerAttendance', trainerAttendanceSchema);
export default TrainerAttendance;
