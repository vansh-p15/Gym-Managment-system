import mongoose from 'mongoose';

const dietSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  meal: { type: String, required: true }, // Breakfast, Lunch, Dinner, Snack
  items: [{ type: String }],
  calories: { type: Number, default: 0 },
  notes: { type: String, default: '' },
}, { timestamps: true });

const Diet = mongoose.model('Diet', dietSchema);
export default Diet;
