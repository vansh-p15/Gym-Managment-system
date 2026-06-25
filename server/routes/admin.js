import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { protect, authorize } from '../middleware/auth.js';
import { getRazorpayClient } from '../config/razorpay.js';
import User from '../models/User.js';
import Plan from '../models/Plan.js';
import Membership from '../models/Membership.js';
import Payment from '../models/Payment.js';
import Attendance from '../models/Attendance.js';
import TrainerAttendance from '../models/TrainerAttendance.js';
import TrainerSalary from '../models/TrainerSalary.js';

const router = express.Router();
router.use(protect, authorize('admin'));

// Helper: Validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);
const monthRegex = /^\d{4}-\d{2}$/;

const normalizeMonth = (monthValue) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  if (!monthValue || typeof monthValue !== 'string') return currentMonth;
  return monthRegex.test(monthValue) ? monthValue : currentMonth;
};

const getTrainerSalaryData = async (trainerId, month) => {
  const trainer = await User.findOne({ _id: trainerId, role: 'trainer' });
  if (!trainer) return null;

  const presentDays = await TrainerAttendance.countDocuments({
    trainer: trainerId,
    status: 'present',
    date: { $regex: `^${month}-` },
  });

  const dailyRate = Number(trainer.dailyRate) || 0;
  const amount = presentDays * dailyRate;

  return {
    trainer,
    presentDays,
    dailyRate,
    amount,
  };
};

// ─── DASHBOARD ─────────────────────────────────
router.get('/dashboard', async (req, res) => {
  try {
    const totalMembers = await User.countDocuments({ role: 'member' });
    const totalTrainers = await User.countDocuments({ role: 'trainer' });
    const activeMembers = await User.countDocuments({ role: 'member', status: 'active' });
    const totalRevenue = await Payment.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    const totalTrainerPayout = await TrainerSalary.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]);
    const activeMemberships = await Membership.countDocuments({ status: 'active' });
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayAttendance = await Attendance.countDocuments({ date: todayStr, status: 'present' });
    const todayTrainerAttendance = await TrainerAttendance.countDocuments({ date: todayStr, status: 'present' });

    res.json({
      totalMembers,
      totalTrainers,
      activeMembers,
      totalRevenue: totalRevenue[0]?.total || 0,
      totalTrainerPayout: totalTrainerPayout[0]?.total || 0,
      activeMemberships,
      todayAttendance,
      todayTrainerAttendance,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── MEMBERS ───────────────────────────────────
router.get('/members', async (req, res) => {
  try {
    const members = await User.find({ role: 'member' }).populate('assignedTrainer', 'name').sort({ createdAt: -1 });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/members/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid member ID format' });
    }
    const allowed = ['name', 'phone', 'gender', 'age', 'status', 'assignedTrainer'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/members/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid member ID format' });
    }
    await User.findByIdAndDelete(req.params.id);
    await Attendance.deleteMany({ member: req.params.id });
    await Membership.deleteMany({ member: req.params.id });
    await Payment.deleteMany({ member: req.params.id });
    res.json({ message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── TRAINERS ──────────────────────────────────
router.get('/trainers', async (req, res) => {
  try {
    const [trainers, memberCounts] = await Promise.all([
      User.find({ role: 'trainer' }).sort({ createdAt: -1 }),
      User.aggregate([
        { $match: { role: 'member', assignedTrainer: { $ne: null } } },
        { $group: { _id: '$assignedTrainer', count: { $sum: 1 } } },
      ]),
    ]);

    const countMap = new Map(memberCounts.map((entry) => [String(entry._id), entry.count]));
    const enrichedTrainers = trainers.map((trainer) => ({
      ...trainer.toObject(),
      assignedMembers: countMap.get(String(trainer._id)) || 0,
    }));

    res.json(enrichedTrainers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/trainers', async (req, res) => {
  try {
    const { name, email, password, phone, specialization, experience, certification, dailyRate } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already exists' });

    const trainer = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: 'trainer',
      specialization: specialization || '',
      experience: experience || 0,
      certification: certification || '',
      dailyRate: Number(dailyRate) || 0,
    });
    res.status(201).json(trainer);
  } catch (error) {
    console.error('Add trainer error:', error);
    res.status(500).json({ message: error.message });
  }
});

router.put('/trainers/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid trainer ID format' });
    }
    const allowed = ['name', 'phone', 'specialization', 'experience', 'certification', 'status', 'dailyRate'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    if (updates.dailyRate !== undefined) {
      updates.dailyRate = Number(updates.dailyRate) || 0;
    }
    const trainer = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
    res.json(trainer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/trainers/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid trainer ID format' });
    }
    await User.findByIdAndDelete(req.params.id);
    // Unassign from members
    await User.updateMany({ assignedTrainer: req.params.id }, { assignedTrainer: null });
    await TrainerAttendance.deleteMany({ trainer: req.params.id });
    await TrainerSalary.deleteMany({ trainer: req.params.id });
    res.json({ message: 'Trainer deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── PLANS ─────────────────────────────────────
router.get('/plans', async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/plans', async (req, res) => {
  try {
    const { name, price, duration, features, status } = req.body;

    // Validate required fields
    if (!name || !price || !duration) {
      return res.status(400).json({ message: 'Name, price, and duration are required' });
    }

    // Validate price and duration are valid numbers
    if (isNaN(price) || price <= 0 || isNaN(duration) || duration <= 0) {
      return res.status(400).json({ message: 'Price and duration must be positive numbers' });
    }

    const plan = await Plan.create({ name, price, duration, features, status });
    res.status(201).json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/plans/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid plan ID format' });
    }
    const { name, price, duration, features, status } = req.body;

    // Validate if provided
    if (price && (isNaN(price) || price <= 0)) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }
    if (duration && (isNaN(duration) || duration <= 0)) {
      return res.status(400).json({ message: 'Duration must be a positive number' });
    }

    const plan = await Plan.findByIdAndUpdate(req.params.id, { name, price, duration, features, status }, { new: true });
    res.json(plan);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/plans/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid plan ID format' });
    }
    await Plan.findByIdAndDelete(req.params.id);
    res.json({ message: 'Plan deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── PAYMENTS ──────────────────────────────────
router.get('/payments', async (req, res) => {
  try {
    const payments = await Payment.find().populate('member', 'name email').populate('plan', 'name').sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/payments', async (req, res) => {
  try {
    const { member, plan, amount, status, method } = req.body;

    // Validate required fields
    if (!member || !amount) {
      return res.status(400).json({ message: 'Member and amount are required' });
    }

    if (!isValidObjectId(member)) {
      return res.status(400).json({ message: 'Invalid member ID format' });
    }

    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number' });
    }

    const payment = await Payment.create({ member, plan, amount, status, method });
    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── MEMBERSHIPS ───────────────────────────────
router.post('/memberships', async (req, res) => {
  try {
    const { memberId, planId } = req.body;

    if (!memberId || !planId) {
      return res.status(400).json({ message: 'Member ID and Plan ID are required' });
    }

    if (!isValidObjectId(memberId) || !isValidObjectId(planId)) {
      return res.status(400).json({ message: 'Invalid member or plan ID format' });
    }

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    const start = new Date();
    const end = new Date();
    end.setMonth(end.getMonth() + plan.duration);

    // Expire any existing active membership
    await Membership.updateMany({ member: memberId, status: 'active' }, { status: 'expired' });

    const membership = await Membership.create({ member: memberId, plan: planId, startDate: start, endDate: end, status: 'active' });

    // Create payment record
    await Payment.create({ member: memberId, plan: planId, amount: plan.price, status: 'paid', method: 'cash' });

    res.status(201).json(membership);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ATTENDANCE ────────────────────────────────
router.get('/attendance', async (req, res) => {
  try {
    const { date } = req.query;
    const filter = date ? { date } : {};
    const records = await Attendance.find(filter).populate('member', 'name email').sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/attendance - Mark attendance for a member
router.post('/attendance', async (req, res) => {
  try {
    const { memberId, date, status } = req.body;

    if (!memberId || !date || !status) {
      return res.status(400).json({ message: 'Member ID, date, and status are required' });
    }

    if (!isValidObjectId(memberId)) {
      return res.status(400).json({ message: 'Invalid member ID format' });
    }

    const checkIn = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const existing = await Attendance.findOne({ member: memberId, date });
    if (existing) {
      existing.status = status;
      if (status === 'present' && !existing.checkIn) {
        existing.checkIn = checkIn;
      }
      await existing.save();
      const populated = await Attendance.findById(existing._id).populate('member', 'name email');
      return res.json(populated);
    }

    const attendance = await Attendance.create({
      member: memberId,
      date,
      checkIn: status === 'present' ? checkIn : null,
      status
    });
    const populated = await Attendance.findById(attendance._id).populate('member', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/attendance/:id - Delete attendance record
router.delete('/attendance/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid attendance ID format' });
    }
    await Attendance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Attendance deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/trainer-attendance
router.get('/trainer-attendance', async (req, res) => {
  try {
    const { date } = req.query;
    const filter = date ? { date } : {};
    const records = await TrainerAttendance.find(filter).populate('trainer', 'name email dailyRate').sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/admin/trainer-attendance/:id
router.delete('/trainer-attendance/:id', async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid trainer attendance ID format' });
    }
    await TrainerAttendance.findByIdAndDelete(req.params.id);
    res.json({ message: 'Trainer attendance deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/admin/trainer-salaries?month=YYYY-MM
router.get('/trainer-salaries', async (req, res) => {
  try {
    const month = normalizeMonth(req.query.month);
    const prefix = `^${month}-`;

    const [trainers, attendanceSummary, salaryRecords] = await Promise.all([
      User.find({ role: 'trainer' }).select('name email dailyRate status').sort({ name: 1 }),
      TrainerAttendance.aggregate([
        { $match: { status: 'present', date: { $regex: prefix } } },
        { $group: { _id: '$trainer', presentDays: { $sum: 1 } } },
      ]),
      TrainerSalary.find({ month }),
    ]);

    const attendanceMap = new Map(attendanceSummary.map((entry) => [String(entry._id), entry.presentDays]));
    const salaryMap = new Map(salaryRecords.map((entry) => [String(entry.trainer), entry]));

    const rows = trainers.map((trainer) => {
      const presentDays = attendanceMap.get(String(trainer._id)) || 0;
      const dailyRate = Number(trainer.dailyRate) || 0;
      const calculatedAmount = presentDays * dailyRate;
      const salaryRecord = salaryMap.get(String(trainer._id));

      return {
        trainer,
        month,
        presentDays,
        dailyRate,
        calculatedAmount,
        paymentStatus: salaryRecord?.status || 'pending',
        paidAmount: salaryRecord?.amount || 0,
        method: salaryRecord?.method || null,
        paidOn: salaryRecord?.paidOn || null,
        salaryRecordId: salaryRecord?._id || null,
      };
    });

    const totals = rows.reduce((acc, row) => ({
      totalAttendanceDays: acc.totalAttendanceDays + row.presentDays,
      totalCalculatedAmount: acc.totalCalculatedAmount + row.calculatedAmount,
      totalPaidAmount: acc.totalPaidAmount + row.paidAmount,
    }), { totalAttendanceDays: 0, totalCalculatedAmount: 0, totalPaidAmount: 0 });

    res.json({ month, rows, totals });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/trainer-salaries/pay
router.post('/trainer-salaries/pay', async (req, res) => {
  try {
    const { trainerId, method, note } = req.body;
    const month = normalizeMonth(req.body.month);

    if (!trainerId || !isValidObjectId(trainerId)) {
      return res.status(400).json({ message: 'Valid trainer ID is required' });
    }

    const salaryData = await getTrainerSalaryData(trainerId, month);
    if (!salaryData) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    const { presentDays, dailyRate, amount } = salaryData;

    if (amount <= 0) {
      return res.status(400).json({ message: 'No payable salary for the selected month. Set daily rate or mark attendance first.' });
    }

    const salary = await TrainerSalary.findOneAndUpdate(
      { trainer: trainerId, month },
      {
        trainer: trainerId,
        month,
        presentDays,
        dailyRate,
        amount,
        status: 'paid',
        method: method || 'bank',
        gatewayOrderId: '',
        transactionId: '',
        note: note || '',
        paidOn: new Date(),
        createdBy: req.user._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('trainer', 'name email');

    res.json(salary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/trainer-salaries/create-order
router.post('/trainer-salaries/create-order', async (req, res) => {
  try {
    const { trainerId } = req.body;
    const month = normalizeMonth(req.body.month);

    if (!trainerId || !isValidObjectId(trainerId)) {
      return res.status(400).json({ message: 'Valid trainer ID is required' });
    }

    const salaryData = await getTrainerSalaryData(trainerId, month);
    if (!salaryData) {
      return res.status(404).json({ message: 'Trainer not found' });
    }

    const { trainer, presentDays, dailyRate, amount } = salaryData;
    if (amount <= 0) {
      return res.status(400).json({ message: 'No payable salary for the selected month. Set daily rate or mark attendance first.' });
    }

    const razorpay = getRazorpayClient();
    const shortReceipt = `trn_${Date.now().toString(36)}_${String(trainer._id).slice(-6)}`;

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt: shortReceipt,
      notes: {
        type: 'trainer-salary',
        trainerId: String(trainer._id),
        trainerName: trainer.name,
        month,
        adminId: String(req.user._id),
      },
    });

    const salary = await TrainerSalary.findOneAndUpdate(
      { trainer: trainerId, month },
      {
        trainer: trainerId,
        month,
        presentDays,
        dailyRate,
        amount,
        status: 'pending',
        method: 'online',
        gatewayOrderId: order.id,
        transactionId: '',
        note: '',
        paidOn: null,
        createdBy: req.user._id,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({
      salaryId: salary._id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      trainerName: trainer.name,
      month,
    });
  } catch (error) {
    const providerMessage = error?.error?.description || error?.message || 'Unknown provider error';
    console.error('Trainer salary create order error:', providerMessage, error);
    res.status(500).json({ message: 'Failed to create Razorpay order for trainer payment.' });
  }
});

// POST /api/admin/trainer-salaries/verify
router.post('/trainer-salaries/verify', async (req, res) => {
  try {
    const {
      salaryId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!salaryId || !isValidObjectId(salaryId)) {
      return res.status(400).json({ message: 'Valid salary ID is required' });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification fields' });
    }

    const salary = await TrainerSalary.findById(salaryId);
    if (!salary) {
      return res.status(404).json({ message: 'Trainer salary record not found' });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed. Signature mismatch.' });
    }

    salary.status = 'paid';
    salary.method = 'online';
    salary.gatewayOrderId = razorpay_order_id;
    salary.transactionId = razorpay_payment_id;
    salary.paidOn = new Date();
    salary.createdBy = req.user._id;
    await salary.save();

    const populated = await TrainerSalary.findById(salary._id).populate('trainer', 'name email');
    res.json({ success: true, salary: populated });
  } catch (error) {
    console.error('Trainer salary verify error:', error);
    res.status(500).json({ message: 'Failed to verify trainer payment.' });
  }
});

// ─── ANALYTICS / REPORTS ───────────────────────
router.get('/analytics', async (req, res) => {
  try {
    // Monthly revenue
    const monthlyRevenue = await Payment.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } }, total: { $sum: '$amount' } } },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    // Monthly signups
    const monthlySignups = await User.aggregate([
      { $match: { role: 'member' } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 12 },
    ]);

    // Plan distribution
    const planDistribution = await Membership.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$plan', count: { $sum: 1 } } },
      { $lookup: { from: 'plans', localField: '_id', foreignField: '_id', as: 'planInfo' } },
      { $unwind: { path: '$planInfo', preserveNullAndEmptyArrays: true } },
    ]);

    res.json({ monthlyRevenue, monthlySignups, planDistribution });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
