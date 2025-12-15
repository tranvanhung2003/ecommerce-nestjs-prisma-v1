import { createZodDto } from 'nestjs-zod';
import { RegisterResSchema, RegisterSchema } from './auth.model';

export class RegisterDto extends createZodDto(RegisterSchema) {}

export class RegisterResDto extends createZodDto(RegisterResSchema) {}
