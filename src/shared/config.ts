import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import z from 'zod';

dotenv.config({
  path: '.env',
});

// Kiểm tra xem có file .env không
if (!fs.existsSync(path.resolve('.env'))) {
  console.error('Không tìm thấy file .env');

  process.exit(1);
}

const configSchema = z.object({
  PORT: z.string(),
  DATABASE_URL: z.string(),
  SECRET_API_KEY: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),

  ADMIN_NAME: z.string(),
  ADMIN_PASSWORD: z.string(),
  ADMIN_EMAIL: z.string(),
  ADMIN_PHONE_NUMBER: z.string(),

  OTP_EXPIRES_IN: z.string(),

  RESEND_API_KEY: z.string(),
});

const configServer = configSchema.safeParse(process.env);

if (!configServer.success) {
  console.error('Các giá trị khai báo trong file .env không hợp lệ');
  console.error(configServer.error);

  process.exit(1);
}

const envConfig = configServer.data;

export default envConfig;
