import {
  VerificationCode,
  VerificationCodeKind,
} from 'src/generated/prisma/client';
import { UserSchema } from 'src/shared/models/shared-user.model';
import z from 'zod';

// RegisterSchema (strict schema) and RegisterType
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

// CreateVerificationCodeSchema and CreateVerificationCodeType
export const CreateVerificationCodeSchema = VerificationCodeSchema.pick({
  email: true,
  code: true,
  type: true,
  expiresAt: true,
});

export type CreateVerificationCodeType = z.infer<
  typeof CreateVerificationCodeSchema
>;

// SendOtpSchema (strict schema) and SendOtpType
export const SendOtpSchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict();

export type SendOtpType = z.infer<typeof SendOtpSchema>;
