import nodemailer from 'nodemailer';

let transporter;

const getTransporter = () => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error('SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in server/.env');
  }

  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  return transporter;
};

const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');

export const sendPaymentSuccessEmail = async ({
  to,
  memberName,
  planName,
  amount,
  transactionId,
  startDate,
  endDate,
}) => {
  if (!to) {
    throw new Error('Recipient email is required for payment success email');
  }

  const smtpFrom = process.env.SMTP_FROM || process.env.SMTP_USER;

  const text = [
    `Hi ${memberName || 'Member'},`,
    '',
    'Your payment has been received successfully.',
    `Plan: ${planName}`,
    `Amount: INR ${amount}`,
    `Transaction ID: ${transactionId}`,
    `Membership Start: ${formatDate(startDate)}`,
    `Membership End: ${formatDate(endDate)}`,
    '',
    'Thank you for choosing FitSphere!',
  ].join('\n');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #222;">
      <h2 style="margin-bottom: 8px;">Payment Successful</h2>
      <p>Hi ${memberName || 'Member'},</p>
      <p>Your payment has been received successfully.</p>
      <table style="border-collapse: collapse; width: 100%; margin: 16px 0;">
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Plan</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${planName}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Amount</strong></td><td style="padding: 8px; border: 1px solid #ddd;">INR ${amount}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Transaction ID</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${transactionId}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Membership Start</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formatDate(startDate)}</td></tr>
        <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Membership End</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formatDate(endDate)}</td></tr>
      </table>
      <p>Thank you for choosing FitSphere.</p>
    </div>
  `;

  await getTransporter().sendMail({
    from: smtpFrom,
    to,
    subject: 'FitSphere Payment Confirmation',
    text,
    html,
  });
};
