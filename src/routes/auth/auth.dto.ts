import { createZodDto } from 'nestjs-zod';
import { RegisterResSchema, RegisterSchema, SendOtpSchema } from './auth.model';

export class RegisterDto extends createZodDto(RegisterSchema.strict()) {}

export class RegisterResDto extends createZodDto(RegisterResSchema) {}

export class SendOtpDto extends createZodDto(SendOtpSchema.strict()) {}
