import { createZodDto } from 'nestjs-zod';
import { User, UserStatus } from 'src/generated/prisma/client';
import z from 'zod';

const UserSchema = z.object({
  id: z.number(),
  email: z.email(),
  name: z.string(),
  phoneNumber: z.string(),
  avatar: z.string().nullable(),
  status: z.enum(UserStatus),
  roleId: z.number(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

export class UserDto
  extends createZodDto(UserSchema)
  implements Omit<User, 'password' | 'totpSecret'> {}

const RegisterSchema = z
  .object({
    email: z.email(),
    password: z.string().min(6).max(100),
    name: z.string().min(1).max(100),
    confirmPassword: z.string().min(6).max(100),
    phoneNumber: z.string().min(9).max(15),
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

export class RegisterDto extends createZodDto(RegisterSchema) {}
