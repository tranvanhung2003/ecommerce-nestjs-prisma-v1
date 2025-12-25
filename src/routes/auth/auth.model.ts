import { oauth2_v2 } from 'googleapis';
import {
  Device,
  RefreshToken,
  Role,
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
        message: 'Mật khẩu và xác nhận mật khẩu không khớp',
        path: ['confirmPassword'],
      });
    }
  });

export type RegisterPayload = z.infer<typeof RegisterSchema>;

// ForgotPassword
export const ForgotPasswordSchema = UserSchema.pick({
  email: true,
})
  .safeExtend({
    code: z.string().length(6),
    newPassword: z.string().min(6).max(100),
    confirmNewPassword: z.string().min(6).max(100),
  })
  .superRefine(({ newPassword, confirmNewPassword }, ctx) => {
    if (newPassword !== confirmNewPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Mật khẩu mới và xác nhận mật khẩu mới không khớp',
        path: ['confirmNewPassword'],
      });
    }
  });

export type ForgotPasswordPayload = z.infer<typeof ForgotPasswordSchema>;

// RegisterResponse
export const RegisterResponseSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

export type RegisterResponsePayload = z.infer<typeof RegisterResponseSchema>;

// CreateUser
export const CreateUserSchema = UserSchema.pick({
  email: true,
  name: true,
  password: true,
  phoneNumber: true,
  avatar: true,
  roleId: true,
});

export type CreateUserPayload = z.infer<typeof CreateUserSchema>;

// UpdateUser
export const UpdateUserSchema = CreateUserSchema.partial();

export type UpdateUserPayload = z.infer<typeof UpdateUserSchema>;

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

// ValidateVerificationCode
export const ValidateVerificationCodeSchema = VerificationCodeSchema.pick({
  email: true,
  code: true,
  type: true,
});

export type ValidateVerificationCodePayload = z.infer<
  typeof ValidateVerificationCodeSchema
>;

// SendOtp
export const SendOtpSchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
});

export type SendOtpPayload = z.infer<typeof SendOtpSchema>;

// DoRefreshTokenResponse
export const DoRefreshTokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});

export type DoRefreshTokenResponsePayload = z.infer<
  typeof DoRefreshTokenResponseSchema
>;

// Login
export const LoginSchema = UserSchema.pick({
  email: true,
  password: true,
}).safeExtend({
  totpCode: z.string().length(6).optional(), // 2FA code
  code: z.string().length(6).optional(), // Email OTP code
});

export type LoginPayload = z.infer<typeof LoginSchema>;

// LoginResponse
export const LoginResponseSchema = DoRefreshTokenResponseSchema;

export type LoginResponsePayload = z.infer<typeof LoginResponseSchema>;

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

// DoRefreshToken
export const DoRefreshTokenSchema = z.object({
  refreshToken: z.string(),
});

export type DoRefreshTokenPayload = z.infer<typeof DoRefreshTokenSchema>;

// Logout
export const LogoutSchema = DoRefreshTokenSchema;

export type LogoutPayload = z.infer<typeof LogoutSchema>;

// Device
export const DeviceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userAgent: z.string(),
  ip: z.string(),
  lastActive: z.date(),
  createdAt: z.date(),
  isActive: z.boolean(),
}) satisfies z.ZodType<Device>;

export type DevicePayload = z.infer<typeof DeviceSchema>;

// CreateDevice
export const CreateDeviceSchema = DeviceSchema.pick({
  userId: true,
  userAgent: true,
  ip: true,
}).safeExtend(
  DeviceSchema.pick({
    lastActive: true,
    isActive: true,
  }).partial().shape,
);

export type CreateDevicePayload = z.infer<typeof CreateDeviceSchema>;

// UpdateDevice
export const UpdateDeviceSchema = CreateDeviceSchema.partial();

export type UpdateDevicePayload = z.infer<typeof UpdateDeviceSchema>;

// Role
export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
}) satisfies z.ZodType<Role>;

export type RolePayload = z.infer<typeof RoleSchema>;

// User$Role
export const User$RoleSchema = UserSchema.safeExtend({
  role: RoleSchema,
});

export type User$RolePayload = z.infer<typeof User$RoleSchema>;

// RefreshToken$User$Role
export const RefreshToken$User$RoleSchema = RefreshTokenSchema.safeExtend({
  user: User$RoleSchema,
});

export type RefreshToken$User$RolePayload = z.infer<
  typeof RefreshToken$User$RoleSchema
>;

// GetAuthorizationUrl
export const GetAuthorizationUrlSchema = DeviceSchema.pick({
  userAgent: true,
  ip: true,
});

export type GetAuthorizationUrlPayload = z.infer<
  typeof GetAuthorizationUrlSchema
>;

// GetAuthorizationUrlResponse
export const GetAuthorizationUrlResponseSchema = z.object({
  url: z.url(),
});

export type GetAuthorizationUrlResponsePayload = z.infer<
  typeof GetAuthorizationUrlResponseSchema
>;

// GoogleCallback
export const GoogleCallbackSchema = z.object({
  code: z.string(),
  state: z.string(),
});

export type GoogleCallbackPayload = z.infer<typeof GoogleCallbackSchema>;

// GoogleAuthState
export const GoogleAuthStateSchema = GetAuthorizationUrlSchema;

export type GoogleAuthStatePayload = z.infer<typeof GoogleAuthStateSchema>;

// RegisterWithGoogle
export interface RegisterWithGooglePayload extends Omit<
  oauth2_v2.Schema$Userinfo,
  'email'
> {
  email: NonNullable<oauth2_v2.Schema$Userinfo['email']>;
}

// LoginWithGoogle
export const LoginWithGoogleSchema = z.object({
  user: User$RoleSchema,
  devicePayload: DeviceSchema.pick({
    userAgent: true,
    ip: true,
  }),
});

export type LoginWithGooglePayload = z.infer<typeof LoginWithGoogleSchema>;

// DisableTwoFactorAuth
export const DisableTwoFactorAuthSchema = z
  .object({
    totpCode: z.string().length(6).optional(), // 2FA code
    code: z.string().length(6).optional(), // Email OTP code
  })
  .superRefine(({ totpCode, code }, ctx) => {
    // Chỉ được gửi lên một trong hai trường totpCode hoặc code
    if ((totpCode && code) || (!totpCode && !code)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Chỉ được gửi lên một trong hai trường totpCode hoặc code',
        path: ['totpCode', 'code'],
      });
    }
  });

export type DisableTwoFactorAuthPayload = z.infer<
  typeof DisableTwoFactorAuthSchema
>;

// SetupTwoFactorAuthResponse
export const SetupTwoFactorAuthResponseSchema = z.object({
  secret: z.string(),
  url: z.string(),
});

export type SetupTwoFactorAuthResponsePayload = z.infer<
  typeof SetupTwoFactorAuthResponseSchema
>;
