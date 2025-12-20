import { createZodDto } from 'nestjs-zod';
import {
  LoginResSchema,
  LoginSchema,
  RegisterResSchema,
  RegisterSchema,
  SendOtpSchema,
} from './auth.model';

export class RegisterDto extends createZodDto(RegisterSchema.strict()) {}

export class RegisterResDto extends createZodDto(RegisterResSchema) {}

export class SendOtpDto extends createZodDto(SendOtpSchema.strict()) {}

export class LoginDto extends createZodDto(LoginSchema.strict()) {}

export class LoginResDto extends createZodDto(LoginResSchema) {}
