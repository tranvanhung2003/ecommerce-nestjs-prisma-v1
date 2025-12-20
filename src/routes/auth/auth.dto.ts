import { createZodDto } from 'nestjs-zod';
import {
  LoginResponseSchema,
  LoginSchema,
  RegisterResponseSchema,
  RegisterSchema,
  SendOtpSchema,
} from './auth.model';

export class RegisterDto extends createZodDto(RegisterSchema.strict()) {}

export class RegisterResponseDto extends createZodDto(RegisterResponseSchema) {}

export class SendOtpDto extends createZodDto(SendOtpSchema.strict()) {}

export class LoginDto extends createZodDto(LoginSchema.strict()) {}

export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}
