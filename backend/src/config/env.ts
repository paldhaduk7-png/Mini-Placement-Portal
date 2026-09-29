import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || '',
  nodeEnv: process.env.NODE_ENV || 'development',
};

if (!config.jwtSecret && config.nodeEnv !== 'test') {
  console.warn('⚠️ WARNING: JWT_SECRET environment variable is missing.');
}
