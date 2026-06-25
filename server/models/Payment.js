import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', default: null },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['cash', 'upi', 'card', 'online'], default: 'cash' },
  status: { type: String, enum: ['paid', 'pending', 'failed'], default: 'paid' },
  transactionId: { type: String, default: '' },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

const Payment = mongoose.model('Payment', paymentSchema);
export default Payment;
