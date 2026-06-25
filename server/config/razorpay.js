import Razorpay from 'razorpay';

export const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

export const getRazorpayKeyId = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  if (!keyId) {
    throw new Error('RAZORPAY_KEY_ID not configured in .env');
  }
  return keyId;
};
