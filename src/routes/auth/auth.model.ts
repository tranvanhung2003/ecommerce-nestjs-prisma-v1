import {
  RefreshToken,
  VerificationCode,
  VerificationCodeKind,
} from 'src/generated/prisma/client';
import { UserSchema } from 'src/shared/models/shared-user.model';
import z from 'zod';

// Register
export const RegisterSchema = UserSchema.pick({
  email: true,
  name: true,
  password: true,
  phoneNumber: true,
})
  .safeExtend({
    confirmPassword: z.string().min(6).max(100),
    code: z.string().length(6),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password and confirm password do not match',
        path: ['confirmPassword'],
      });
    }
  });

export type RegisterPayload = z.infer<typeof RegisterSchema>;

// RegisterRes
export const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

export type RegisterResPayload = z.infer<typeof RegisterResSchema>;

// CreateUser
export const CreateUserSchema = UserSchema.pick({
  email: true,
  name: true,
  password: true,
  phoneNumber: true,
  roleId: true,
});

export type CreateUserPayload = z.infer<typeof CreateUserSchema>;

// VerificationCode
export const VerificationCodeSchema = z.object({
  id: z.number(),
  email: z.email(),
  code: z.string().length(6),
  type: z.enum(VerificationCodeKind),
  expiresAt: z.date(),
  createdAt: z.date(),
}) satisfies z.ZodType<VerificationCode>;

export type VerificationCodePayload = z.infer<typeof VerificationCodeSchema>;

// CreateVerificationCode
export const CreateVerificationCodeSchema = VerificationCodeSchema.pick({
  email: true,
  code: true,
  type: true,
  expiresAt: true,
});

export type CreateVerificationCodePayload = z.infer<
  typeof CreateVerificationCodeSchema
>;

// SendOtp
export const SendOtpSchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
});

export type SendOtpPayload = z.infer<typeof SendOtpSchema>;

// TokenPair
export const TokenPairSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type TokenPairPayload = z.infer<typeof TokenPairSchema>;

// Login
export const LoginSchema = UserSchema.pick({
  email: true,
  password: true,
});

export type LoginPayload = z.infer<typeof LoginSchema>;

// LoginRes
export const LoginResSchema = TokenPairSchema;

export type LoginResPayload = z.infer<typeof LoginResSchema>;

// RefreshToken
export const RefreshTokenSchema = z.object({
  token: z.string(),
  userId: z.number(),
  deviceId: z.number(),
  expiresAt: z.date(),
  createdAt: z.date(),
}) satisfies z.ZodType<RefreshToken>;

export type RefreshTokenPayload = z.infer<typeof RefreshTokenSchema>;

// CreateRefreshToken
export const CreateRefreshTokenSchema = RefreshTokenSchema.pick({
  token: true,
  userId: true,
  deviceId: true,
  expiresAt: true,
});

export type CreateRefreshTokenPayload = z.infer<
  typeof CreateRefreshTokenSchema
>;
