import express from 'express';
import crypto from 'crypto';
import mongoose from 'mongoose';
import { protect, authorize } from '../middleware/auth.js';
import { getRazorpayClient, getRazorpayKeyId } from '../config/razorpay.js';
import { sendPaymentSuccessEmail } from '../config/mailer.js';
import Plan from '../models/Plan.js';
import Payment from '../models/Payment.js';
import Membership from '../models/Membership.js';

const router = express.Router();

// Helper: Validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/payment/key - Return public key for frontend
router.get('/key', (req, res) => {
  try {
    const keyId = getRazorpayKeyId();
    res.json({ keyId });
  } catch (error) {
    console.error('Get Razorpay key error:', error.message);
    res.status(503).json({ message: 'Razorpay not configured. Contact admin.' });
  }
});

// POST /api/payment/create-order - Create Razorpay order for membership upgrade
router.post('/create-order', protect, authorize('member'), async (req, res) => {
  try {
    const { planId } = req.body;

    // Validate planId format and existence
    if (!planId || !isValidObjectId(planId)) {
      return res.status(400).json({ message: 'Invalid plan ID format' });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    if (plan.status !== 'active') {
      return res.status(400).json({ message: 'This plan is not available' });
    }

    // Check if member already has active membership for this plan
    const existingMembership = await Membership.findOne({
      member: req.user._id,
      plan: planId,
      status: 'active'
    });
    if (existingMembership) {
      return res.status(400).json({ message: 'You already have an active membership for this plan' });
    }

    const razorpay = getRazorpayClient();

    // Razorpay receipt
    const shortReceipt = `rcpt_${Date.now().toString(36)}_${req.user._id.toString().slice(-6)}`;

    // Create Razorpay order
    const options = {
      amount: Math.round(plan.price * 100), 
      currency: 'INR',
      receipt: shortReceipt,
      notes: {
        planId: plan._id.toString(),
        planName: plan.name,
        memberId: req.user._id.toString(),
        memberEmail: req.user.email,
      },
    };

    const order = await razorpay.orders.create(options);

    // Create pending payment record
    const payment = await Payment.create({
      member: req.user._id,
      plan: plan._id,
      amount: plan.price,
      method: 'online',
      status: 'pending',
      transactionId: order.id,
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planName: plan.name,
      planDuration: plan.duration,
      paymentId: payment._id,
    });
  } catch (error) {
    const providerMessage = error?.error?.description || error?.message || 'Unknown provider error';
    console.error('Create order error:', providerMessage, error);
    res.status(500).json({ message: 'Failed to create payment order. Please try again.' });
  }
});

// POST /api/payment/verify - Verify payment and create/upgrade membership
router.post('/verify', protect, authorize('member'), async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, paymentId } = req.body;

    // Validate all required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !paymentId) {
      return res.status(400).json({ message: 'Missing payment verification data' });
    }

    // Validate paymentId format
    if (!isValidObjectId(paymentId)) {
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Verify payment belongs to current user
    if (payment.member.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized: Payment does not belong to you' });
    }

    // Check if already verified
    if (payment.status === 'paid') {
      return res.status(400).json({ message: 'Payment already verified' });
    }

    // Verify Razorpay signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      payment.status = 'failed';
      await payment.save();
      console.warn(`Payment signature verification failed for payment ${paymentId}`);
      return res.status(400).json({ message: 'Payment verification failed. Signature mismatch.' });
    }

    // Mark payment as paid
    payment.status = 'paid';
    payment.transactionId = razorpay_payment_id;
    await payment.save();

    // Get plan details
    const plan = await Plan.findById(payment.plan);
    if (!plan) {
      return res.status(404).json({ message: 'Associated plan not found' });
    }

    // Expire existing active memberships
    await Membership.updateMany(
      { member: req.user._id, status: 'active' },
      { status: 'expired' }
    );

    // Create new membership with proper date calculation
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + plan.duration);

    const membership = await Membership.create({
      member: req.user._id,
      plan: plan._id,
      startDate,
      endDate,
      status: 'active',
    });

    try {
      await sendPaymentSuccessEmail({
        to: req.user.email,
        memberName: req.user.name,
        planName: plan.name,
        amount: payment.amount,
        transactionId: payment.transactionId,
        startDate: membership.startDate,
        endDate: membership.endDate,
      });
    } catch (emailError) {
      console.error('Payment success email error:', {
        message: emailError.message,
        code: emailError.code,
        responseCode: emailError.responseCode,
        response: emailError.response,
      });
    }

    res.json({
      success: true,
      message: 'Payment verified and membership activated',
      membership: {
        _id: membership._id,
        startDate: membership.startDate,
        endDate: membership.endDate,
        planName: plan.name,
      },
      payment: {
        _id: payment._id,
        amount: payment.amount,
        transactionId: payment.transactionId,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ message: 'Failed to verify payment. Please contact support.' });
  }
});

export default router;
