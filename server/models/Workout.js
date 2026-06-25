import mongoose from 'mongoose';

const workoutSchema = new mongoose.Schema({
  member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  trainer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  day: { type: String, required: true },
  exercises: [{
    name: { type: String, required: true },
    sets: { type: Number, default: 3 },
    reps: { type: Number, default: 12 },
    duration: { type: String, default: '' },
  }],
}, { timestamps: true });

const Workout = mongoose.model('Workout', workoutSchema);
export default Workout;
