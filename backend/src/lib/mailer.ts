import nodemailer from 'nodemailer';
import path from 'path';
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

export const sendTpoOtpEmail = async (to: string, otp: string) => {
  if (!config.mailUsername) {
    console.warn('Mail configuration is missing. Printing TPO OTP to console instead: ', otp);
    return;
  }
  
  const logoPath = path.join(__dirname, '../../../frontend/public/images/ldce-logo.png');

  const mailOptions = {
    from: `"LD College Placement Cell" <${config.mailFrom}>`,
    to,
    subject: 'LD College - TPO Login Verification',
    text: `Your TPO login verification code is:\n\n${otp}\n\nThis OTP is valid for 5 minutes.\n\nIf you did not attempt to log in, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
        
        <img src="cid:ldce-logo" alt="LDCE Logo" style="width: 80px; height: auto; margin: 0 auto 15px auto; display: block;" />
        
        <h2 style="color: #1e3a8a; margin: 0; font-size: 22px; font-weight: normal;">LD College of Engineering</h2>
        <p style="color: #64748b; margin: 5px 0 30px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">PLACEMENT CELL PORTAL</p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 30px;" />
        
        <h3 style="color: #334155; font-size: 18px; margin: 0 0 15px 0;">Verify TPO Login</h3>
        <p style="color: #475569; font-size: 15px; line-height: 1.5; margin: 0 0 20px 0;">
          Your Training and Placement Officer (TPO)<br />
          login verification code is:
        </p>
        
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 20px; display: inline-block; margin-bottom: 20px;">
          <h1 style="color: #1e40af; letter-spacing: 8px; font-size: 32px; margin: 0; font-family: monospace;">${otp}</h1>
        </div>
        
        <p style="color: #64748b; font-size: 14px; margin: 0 0 25px 0;">
          This code will expire in 5 minutes.
        </p>
        
        <p style="color: #64748b; font-size: 13px; line-height: 1.5; margin: 0 0 30px 0;">
          If you did not attempt to log in to the<br />
          Placement Cell Portal, you can safely ignore<br />
          this email.
        </p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-bottom: 20px;" />
        
        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 5px 0;">LDCE Placement Cell</p>
        <p style="color: #94a3b8; font-size: 12px; margin: 0 0 15px 0;">Mini Placement Portal</p>
        <p style="color: #cbd5e1; font-size: 11px; margin: 0;">© ${new Date().getFullYear()} Mini Placement Portal</p>
        
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 20px;" />
      </div>
    `,
    attachments: [
      {
        filename: 'ldce-logo.png',
        path: logoPath,
        cid: 'ldce-logo'
      }
    ]
  };

  await transporter.sendMail(mailOptions);
};
