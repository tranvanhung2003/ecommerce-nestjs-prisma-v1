import { HTTPMethod, Permission } from 'src/generated/prisma/client';
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

// CreatePermission
export const CreatePermissionSchema = PermissionSchema.pick({
  name: true,
  path: true,
  method: true,
});

export type CreatePermissionPayload = z.infer<typeof CreatePermissionSchema>;

// UpdatePermission
export const UpdatePermissionSchema = CreatePermissionSchema.partial();

export type UpdatePermissionPayload = z.infer<typeof UpdatePermissionSchema>;

// PermissionParams
export const PermissionParamsSchema = z.object({
  id: z.coerce.number(),
});

export type PermissionParamsPayload = z.infer<typeof PermissionParamsSchema>;

// PermissionQuery
export const PermissionQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type PermissionQueryPayload = z.infer<typeof PermissionQuerySchema>;

// PermissionResponse
export const PermissionResponseSchema = PermissionSchema;

export type PermissionResponsePayload = z.infer<
  typeof PermissionResponseSchema
>;

// PermissionListResponse
export const PermissionListResponseSchema = z.object({
  data: z.array(PermissionSchema),
  totalItems: z.number(), // Tổng số item
  page: z.number(), // Số trang hiện tại
  limit: z.number(), // Số item trên một trang
  totalPages: z.number(), // Tổng số trang
});

export type PermissionListResponsePayload = z.infer<
  typeof PermissionListResponseSchema
>;
