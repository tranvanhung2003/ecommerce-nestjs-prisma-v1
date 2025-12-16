import {
  User,
  UserStatus,
  VerificationCode,
  VerificationCodeKind,
} from 'src/generated/prisma/client';
import z from 'zod';

// UserSchema and UserType
export const UserSchema = z.object({
  id: z.number(),
  email: z.email(),
  name: z.string().min(1).max(100),
  password: z.string().min(6).max(100),
  phoneNumber: z.string().min(9).max(15),
  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  status: z.enum(UserStatus),
  roleId: z.number(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
}) satisfies z.ZodType<User>;

export type UserType = z.infer<typeof UserSchema>;

// RegisterSchema (strict schema) and RegisterType
export const RegisterSchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  phoneNumber: true,
})
  .safeExtend({
    confirmPassword: z.string().min(6).max(100),
  })
  .strict()
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Password and confirm password do not match',
        path: ['confirmPassword'],
      });
    }
  });

export type RegisterType = z.infer<typeof RegisterSchema>;

// RegisterResSchema and RegisterResType
export const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

export type RegisterResType = z.infer<typeof RegisterResSchema>;

// CreateUserSchema and CreateUserType
export const CreateUserSchema = UserSchema.pick({
  email: true,
  name: true,
  password: true,
  phoneNumber: true,
  roleId: true,
});

export type CreateUserType = z.infer<typeof CreateUserSchema>;

// VerificationCodeSchema and VerificationCodeType
export const VerificationCodeSchema = z.object({
  id: z.number(),
  email: z.email(),
  code: z.string().length(6),
  type: z.enum(VerificationCodeKind),
  expiresAt: z.date(),
  createdAt: z.date(),
}) satisfies z.ZodType<VerificationCode>;

export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>;

// SendOtpSchema (strict schema) and SendOtpType
export const SendOtpSchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict();

export type SendOtpType = z.infer<typeof SendOtpSchema>;
