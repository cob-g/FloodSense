import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

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
    from: `"FloodSense" <${process.env.EMAIL_USER}>`,
    to: process.env.CONTACT_EMAIL,
    replyTo: email,
    subject: `[FloodSense Contact] ${category}: ${subject}`,
    html: `
      <div style="font-family: system-ui, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #c54914, #7a2200); padding: 24px; border-radius: 12px 12px 0 0;">
          <h2 style="color: white; margin: 0; font-size: 20px;">New Contact Form Submission</h2>
          <p style="color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 13px;">FloodSense — North Caloocan</p>
        </div>
        <div style="background: #fff; padding: 24px; border: 1px solid #e2d5cc; border-top: none; border-radius: 0 0 12px 12px;">
          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tr><td style="padding: 8px 0; color: #6b4030; font-weight: 600; width: 100px;">Name</td><td style="padding: 8px 0; color: #1a0a00;">${name}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b4030; font-weight: 600;">Email</td><td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #c54914;">${email}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #6b4030; font-weight: 600;">Category</td><td style="padding: 8px 0; color: #1a0a00;">${category}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b4030; font-weight: 600;">Subject</td><td style="padding: 8px 0; color: #1a0a00;">${subject}</td></tr>
          </table>
          <hr style="border: none; border-top: 1px solid #e2d5cc; margin: 16px 0;" />
          <p style="color: #6b4030; font-weight: 600; font-size: 13px; margin: 0 0 8px;">Message</p>
          <p style="color: #3d2010; font-size: 14px; line-height: 1.6; margin: 0;">${message.replace(/\n/g, '<br>')}</p>
          <hr style="border: none; border-top: 1px solid #e2d5cc; margin: 16px 0;" />
          <p style="color: #9a6f55; font-size: 12px; margin: 0;">Reply directly to this email to respond to ${name}.</p>
        </div>
      </div>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  console.log('Contact email sent: %s', info.messageId);
  return info;
};
