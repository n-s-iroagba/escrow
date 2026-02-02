import { config } from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables
config({ path: path.join(__dirname, '../../.env') });

// Define schema for environment variables
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  API_VERSION: z.string().default('v1'),
  API_BASE_URL: z.string().default('http://localhost:3000/api'),
  
  // Database
  DB_HOST: z.string().default('localhost'),
  DB_PORT: z.string().default('3306'),
  DB_NAME: z.string().default('escrow'),
  DB_USER: z.string().default('root'),
  DB_PASSWORD: z.string().default('97chocho'),
  
  // JWT
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  
  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('noreply@escrowplatform.com'),
  
  // Frontend
  FRONTEND_URL: z.string().default('http://localhost:3000'),
  VERIFICATION_BASE_URL: z.string().optional(),
  RESET_PASSWORD_BASE_URL: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly']).default('info'),
});

// Validate environment variables
const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('❌ Invalid environment variables:', env.error.format());
  process.exit(1);
}

export default env.data;