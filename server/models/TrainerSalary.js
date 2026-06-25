import mongoose from 'mongoose';

const trainerSalarySchema = new mongoose.Schema({
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true }, // YYYY-MM
  presentDays: { type: Number, default: 0 },
  dailyRate: { type: Number, default: 0 },
  amount: { type: Number, default: 0 },
  status: { type: String, enum: ['paid', 'pending'], default: 'pending' },
  method: { type: String, enum: ['cash', 'upi', 'card', 'online', 'bank'], default: 'bank' },
  gatewayOrderId: { type: String, default: '' },
  transactionId: { type: String, default: '' },
  paidOn: { type: Date, default: null },
  note: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

trainerSalarySchema.index({ trainer: 1, month: 1 }, { unique: true });

const TrainerSalary = mongoose.model('TrainerSalary', trainerSalarySchema);
export default TrainerSalary;
