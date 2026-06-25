import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Membership from '../models/Membership.js';
import Payment from '../models/Payment.js';
import Workout from '../models/Workout.js';

const router = express.Router();
router.use(protect, authorize('member'));

// GET /api/member/profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('assignedTrainer', 'name email phone specialization');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/member/profile
router.put('/profile', async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'gender', 'age', 'address', 'height', 'weight', 'emergencyContact'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/member/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const membership = await Membership.findOne({ member: req.user._id, status: 'active' }).populate('plan');
    const attendanceCount = await Attendance.countDocuments({ member: req.user._id, status: 'present' });
    const thisMonth = new Date().toISOString().slice(0, 7);
    const monthlyAttendance = await Attendance.countDocuments({
      member: req.user._id,
      status: 'present',
      date: { $gte: new Date(thisMonth + '-01'), $lt: new Date(thisMonth + '-32') }  // Fixed: Replaced regex with date range
    });
    const payments = await Payment.find({ member: req.user._id }).sort({ date: -1 }).limit(5);

    res.json({
      membership,
      totalAttendance: attendanceCount,
      monthlyAttendance,
      recentPayments: payments,
      daysRemaining: membership ? Math.max(0, Math.ceil((new Date(membership.endDate) - new Date()) / 86400000)) : 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/member/attendance/checkin
router.post('/attendance/checkin', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const existing = await Attendance.findOne({ member: req.user._id, date: today });
    if (existing) return res.status(400).json({ message: 'Already checked in today', attendance: existing });

    const checkIn = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const attendance = await Attendance.create({ member: req.user._id, date: today, checkIn, status: 'present' });
    res.status(201).json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/member/attendance/checkout
router.put('/attendance/checkout', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const attendance = await Attendance.findOne({ member: req.user._id, date: today });
    if (!attendance) return res.status(400).json({ message: 'Not checked in today' });
    if (attendance.checkOut) return res.status(400).json({ message: 'Already checked out', attendance });

    attendance.checkOut = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    await attendance.save();
    res.json(attendance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/member/attendance
router.get('/attendance', async (req, res) => {
  try {
    const records = await Attendance.find({ member: req.user._id }).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/member/attendance/today
router.get('/attendance/today', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const attendance = await Attendance.findOne({ member: req.user._id, date: today });
    res.json(attendance || { checked: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/member/membership
router.get('/membership', async (req, res) => {
  try {
    const memberships = await Membership.find({ member: req.user._id }).populate('plan').sort({ createdAt: -1 });
    res.json(memberships);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/member/workouts
router.get('/workouts', async (req, res) => {
  try {
    const workouts = await Workout.find({ member: req.user._id }).populate('trainer', 'name');
    res.json(workouts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/member/payments
router.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find({ member: req.user._id }).populate('plan', 'name').sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
