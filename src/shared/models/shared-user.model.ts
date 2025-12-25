import { User, UserStatus } from 'src/generated/prisma/client';
import z from 'zod';

// User
export const UserSchema = z.object({
  id: z.number(),
  email: z.email(),
  name: z.string().min(1).max(100),
  password: z.string().min(6).max(100),
  // phoneNumber có thể để trống chuỗi nếu người dùng đăng ký bằng Google OAuth
  // nếu không thì phải có định dạng số điện thoại (chứa từ 9-15 ký tự số)
  phoneNumber: z.union([z.string().min(9).max(15), z.literal('')]),
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

export type UserPayload = z.infer<typeof UserSchema>;
