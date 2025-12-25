import { createZodDto } from 'nestjs-zod';
import {
  DisableTwoFactorAuthSchema,
  DoRefreshTokenResponseSchema,
  DoRefreshTokenSchema,
  ForgotPasswordSchema,
  GetAuthorizationUrlResponseSchema,
  LoginResponseSchema,
  LoginSchema,
  LogoutSchema,
  RegisterResponseSchema,
  RegisterSchema,
  SendOtpSchema,
  SetupTwoFactorAuthResponseSchema,
} from './auth.model';

export class RegisterDto extends createZodDto(RegisterSchema.strict()) {}

export class ForgotPasswordDto extends createZodDto(
  ForgotPasswordSchema.strict(),
) {}

export class RegisterResponseDto extends createZodDto(RegisterResponseSchema) {}

export class SendOtpDto extends createZodDto(SendOtpSchema.strict()) {}

export class LoginDto extends createZodDto(LoginSchema.strict()) {}

export class LoginResponseDto extends createZodDto(LoginResponseSchema) {}

export class DoRefreshTokenDto extends createZodDto(
  DoRefreshTokenSchema.strict(),
) {}

export class DoRefreshTokenResponseDto extends createZodDto(
  DoRefreshTokenResponseSchema,
) {}

export class LogoutDto extends createZodDto(LogoutSchema.strict()) {}

export class GetAuthorizationUrlResponseDto extends createZodDto(
  GetAuthorizationUrlResponseSchema,
) {}

export class SetupTwoFactorAuthResponseDto extends createZodDto(
  SetupTwoFactorAuthResponseSchema,
) {}

export class DisableTwoFactorAuthDto extends createZodDto(
  DisableTwoFactorAuthSchema.strict(),
) {}
