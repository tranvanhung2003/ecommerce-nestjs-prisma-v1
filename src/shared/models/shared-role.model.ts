import { Role } from 'src/generated/prisma/client';
import z from 'zod';

// Role
export const RoleSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  description: z.string().default(''),
  isActive: z.boolean().default(true),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
}) satisfies z.ZodType<Role>;

export type RolePayload = z.infer<typeof RoleSchema>;
