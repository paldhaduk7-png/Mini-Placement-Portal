import nodemailer from 'nodemailer';
import { config } from '../config/env';

const transporter = nodemailer.createTransport({
  host: config.mailServer || 'smtp.gmail.com',
  port: config.mailPort,
  secure: config.mailPort === 465,
  auth: {
    user: config.mailUsername,
    pass: config.mailPassword,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

export const sendOtpEmail = async (to: string, otp: string) => {
  if (!config.mailUsername) {
    console.warn('Mail configuration is missing. Printing OTP to console instead: ', otp);
    return;
  }
  
  const senderAddress = config.mailFrom || config.mailUsername;

  const mailOptions = {
    from: senderAddress,
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

export const sendTpoOtpEmail = async (to: string, otp: string) => {
  if (!config.mailUsername) {
    console.warn('Mail configuration is missing. Printing TPO OTP to console instead: ', otp);
    return;
  }

  const senderAddress = config.mailFrom || config.mailUsername;

  const mailOptions = {
    from: `"LD College Placement Cell" <${senderAddress}>`,
    to,
    subject: 'LD College - TPO Login Verification',
    text: `Your TPO login verification code is:\n\n${otp}\n\nThis OTP is valid for 5 minutes.\n\nIf you did not attempt to log in, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; text-align: center; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="padding-bottom: 16px; border-bottom: 2px solid #1e3a8a; margin-bottom: 24px;">
          <h2 style="color: #1e3a8a; margin: 0; font-size: 20px; font-weight: bold; letter-spacing: 0.5px;">L.D. COLLEGE OF ENGINEERING</h2>
          <p style="color: #64748b; margin: 4px 0 0 0; font-size: 13px; text-transform: uppercase; font-weight: 600; letter-spacing: 1.5px;">Training &amp; Placement Cell</p>
        </div>
        
        <h3 style="color: #334155; font-size: 17px; margin: 0 0 12px 0;">Verify TPO Login</h3>
        <p style="color: #475569; font-size: 14px; line-height: 1.5; margin: 0 0 20px 0;">
          Your Training and Placement Officer (TPO)<br />
          login verification code is:
        </p>
        
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px 24px; display: inline-block; margin-bottom: 20px;">
          <h1 style="color: #1e40af; letter-spacing: 8px; font-size: 32px; margin: 0; font-family: monospace;">${otp}</h1>
        </div>
        
        <p style="color: #64748b; font-size: 13px; margin: 0 0 20px 0;">
          This code will expire in 5 minutes.
        </p>
        
        <p style="color: #94a3b8; font-size: 12px; line-height: 1.5; margin: 0 0 24px 0;">
          If you did not attempt to log in to the<br />
          Placement Cell Portal, you can safely ignore this email.
        </p>
        
        <div style="border-top: 1px solid #e2e8f0; padding-top: 16px;">
          <p style="color: #94a3b8; font-size: 11px; margin: 0 0 4px 0;">LDCE Training &amp; Placement Cell • Ahmedabad</p>
          <p style="color: #cbd5e1; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Mini Placement Portal</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
