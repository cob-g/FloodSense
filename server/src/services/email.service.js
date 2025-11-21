import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Ensure environment variables are loaded before creating the transporter
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendContactEmail = async ({ name, email, subject, category, message }) => {
  const mailOptions = {
    from: `"${name}" <${process.env.EMAIL_USER}>`, // Sender address (must be authenticated user for Gmail usually)
    to: process.env.EMAIL_USER, // Send to yourself/admin
    replyTo: email, // User's email
    subject: `[FloodSense Contact] ${category}: ${subject}`,
    html: `
      <h3>New Contact Form Submission</h3>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Subject:</strong> ${subject}</p>
      <hr/>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  };

  try {
    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
