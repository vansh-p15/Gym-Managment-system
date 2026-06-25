import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Workout from '../models/Workout.js';
import Schedule from '../models/Schedule.js';
import Attendance from '../models/Attendance.js';
import TrainerAttendance from '../models/TrainerAttendance.js';

const router = express.Router();
router.use(protect, authorize('trainer'));

// GET /api/trainer/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const assignedMembers = await User.find({ assignedTrainer: req.user._id, role: 'member' }).select('name email phone status');
    const todayStr = new Date().toISOString().slice(0, 10);
    const todaySchedule = await Schedule.find({ trainer: req.user._id, day: new Date().toLocaleDateString('en-US', { weekday: 'long' }) });
    const totalWorkouts = await Workout.countDocuments({ trainer: req.user._id });
    const todayAttendance = await TrainerAttendance.findOne({ trainer: req.user._id, date: todayStr });

    res.json({
      totalMembers: assignedMembers.length,
      members: assignedMembers,
      todaySchedule,
      totalWorkouts,
      todayAttendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/trainer/members
router.get('/members', async (req, res) => {
  try {
    const members = await User.find({ assignedTrainer: req.user._id, role: 'member' });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/trainer/workout
router.post('/workout', async (req, res) => {
  try {
    const { memberId, day, exercises } = req.body;
    // Verify the member is assigned to this trainer
    const member = await User.findOne({ _id: memberId, assignedTrainer: req.user._id });
    if (!member) return res.status(403).json({ message: 'Member not assigned to you' });

    const workout = await Workout.findOneAndUpdate(
      { member: memberId, trainer: req.user._id, day },
      { member: memberId, trainer: req.user._id, day, exercises },
      { upsert: true, new: true }
    );
    res.json(workout);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/trainer/member/:id/progress
router.get('/member/:id/progress', async (req, res) => {
  try {
    const member = await User.findOne({ _id: req.params.id, assignedTrainer: req.user._id });
    if (!member) return res.status(403).json({ message: 'Member not assigned to you' });

    const attendance = await Attendance.find({ member: req.params.id }).sort({ date: -1 }).limit(30);
    const workouts = await Workout.find({ member: req.params.id, trainer: req.user._id });

    res.json({ member, attendance, workouts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/trainer/schedule
router.get('/schedule', async (req, res) => {
  try {
    const schedules = await Schedule.find({ trainer: req.user._id }).populate('members', 'name');
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/trainer/schedule
router.post('/schedule', async (req, res) => {
  try {
    const { day, startTime, endTime, activity, members } = req.body;
    const schedule = await Schedule.create({
      trainer: req.user._id, day, startTime, endTime, activity, members: members || [],
    });
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/trainer/attendance/checkin
router.post('/attendance/checkin', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const existing = await TrainerAttendance.findOne({ trainer: req.user._id, date: today });
    if (existing) return res.status(400).json({ message: 'Already checked in today', attendance: existing });

    const checkIn = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const attendance = await TrainerAttendance.create({ trainer: req.user._id, date: today, checkIn, status: 'present' });
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/trainer/attendance/checkout
router.put('/attendance/checkout', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const attendance = await TrainerAttendance.findOne({ trainer: req.user._id, date: today });
    if (!attendance) return res.status(400).json({ message: 'Not checked in today' });
    if (attendance.checkOut) return res.status(400).json({ message: 'Already checked out', attendance });

    attendance.checkOut = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/trainer/attendance
router.get('/attendance', async (req, res) => {
  try {
    const records = await TrainerAttendance.find({ trainer: req.user._id }).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/trainer/attendance/today
router.get('/attendance/today', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const attendance = await TrainerAttendance.findOne({ trainer: req.user._id, date: today });
    res.json(attendance || { checked: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
