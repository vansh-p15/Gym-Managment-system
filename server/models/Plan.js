import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  duration: { type: Number, required: true }, // in months
  price: { type: Number, required: true },
  features: [{ type: String }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
}, { timestamps: true });

const Plan = mongoose.model('Plan', planSchema);
export default Plan;
