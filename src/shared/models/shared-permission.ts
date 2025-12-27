import { Permission } from 'src/generated/prisma/client';
import { HTTPMethod } from 'src/generated/prisma/enums';
import z from 'zod';

// Permission
export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string().max(500),
  description: z.string().default(''),
  path: z.string().max(1000),
  method: z.enum(HTTPMethod),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
}) satisfies z.ZodType<Permission>;

export type PermissionPayload = z.infer<typeof PermissionSchema>;
