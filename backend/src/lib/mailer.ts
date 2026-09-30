import nodemailer from 'nodemailer';
import { config } from '../config/env';

const transporter = nodemailer.createTransport({
  host: config.mailServer,
  port: config.mailPort,
  secure: config.mailPort === 465,
  auth: {
    user: config.mailUsername,
    pass: config.mailPassword,
  },
});

export const sendOtpEmail = async (to: string, otp: string) => {
  if (!config.mailUsername) {
    console.warn('Mail configuration is missing. Printing OTP to console instead: ', otp);
    return;
  }
  
  const mailOptions = {
    from: config.mailFrom,
    to,
    subject: 'Password Reset OTP - Mini Placement Portal',
    text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset</h2>
        <p>Your One Time Password (OTP) for resetting your password is:</p>
        <h1 style="color: #4f46e5; letter-spacing: 5px;">${otp}</h1>
        <p>This code will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
