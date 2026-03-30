// src/services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: 587,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY,
  },
});

async function sendEmail({ to, subject, html, text }) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`[Email skipped - no SENDGRID_API_KEY] To: ${to}, Subject: ${subject}`);
    return;
  }
  return transporter.sendMail({
    from: process.env.FROM_EMAIL || 'noreply@educore.ng',
    to, subject, html, text,
  });
}

const templates = {
  feeReminder: ({ studentName, amount, term, dueDate, schoolName }) => ({
    subject: `Fee Payment Reminder — ${schoolName}`,
    html: `
      <h2>${schoolName}</h2>
      <p>Dear Parent/Guardian,</p>
      <p>This is a reminder that the school fee of <strong>₦${Number(amount).toLocaleString()}</strong> for <strong>${studentName}</strong> (Term ${term}) is outstanding.</p>
      ${dueDate ? `<p>Please settle before <strong>${new Date(dueDate).toDateString()}</strong>.</p>` : ''}
      <p>Thank you,<br/>${schoolName}</p>
    `,
  }),

  reportCardReady: ({ studentName, term, schoolName }) => ({
    subject: `Report Card Available — ${studentName}`,
    html: `
      <h2>${schoolName}</h2>
      <p>Dear Parent/Guardian,</p>
      <p>The Term ${term} report card for <strong>${studentName}</strong> is now available. Please log in to the parent portal to view it.</p>
      <p>Thank you,<br/>${schoolName}</p>
    `,
  }),

  welcome: ({ name, email, password, role, schoolName }) => ({
    subject: `Welcome to ${schoolName}`,
    html: `
      <h2>Welcome to ${schoolName}!</h2>
      <p>Dear ${name},</p>
      <p>Your account has been created with the following credentials:</p>
      <p><strong>Email:</strong> ${email}<br/><strong>Password:</strong> ${password}<br/><strong>Role:</strong> ${role}</p>
      <p>Please log in and change your password immediately.</p>
    `,
  }),
};

module.exports = { sendEmail, templates };
