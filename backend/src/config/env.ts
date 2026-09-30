import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  nodeEnv: process.env.NODE_ENV || 'development',
  mailUsername: process.env.MAIL_USERNAME || '',
  mailPassword: (process.env.MAIL_PASSWORD || '').replace(/\s/g, ''),
  mailFrom: process.env.MAIL_FROM || '',
  mailServer: process.env.MAIL_SERVER || 'smtp.gmail.com',
  mailPort: parseInt(process.env.MAIL_PORT || '465', 10),
};

if (!config.jwtSecret && config.nodeEnv !== 'test') {
  console.warn('⚠️ WARNING: JWT_SECRET environment variable is missing.');
}

if (
  (!config.cloudinaryCloudName || !config.cloudinaryApiKey || !config.cloudinaryApiSecret) &&
  config.nodeEnv !== 'test'
) {
  console.warn('⚠️ WARNING: Cloudinary environment variables are incomplete.');
}

// Force reload
