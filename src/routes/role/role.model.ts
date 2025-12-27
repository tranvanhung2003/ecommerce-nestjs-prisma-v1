import { PermissionSchema } from 'src/shared/models/shared-permission';
import { RoleSchema } from 'src/shared/models/shared-role.model';
import z from 'zod';

// Role$Permissions
export const Role$PermissionsSchema = RoleSchema.safeExtend({
  permissions: z.array(PermissionSchema),
});

export type Role$PermissionsPayload = z.infer<typeof Role$PermissionsSchema>;

// CreateRole
export const CreateRoleSchema = RoleSchema.pick({
  name: true,
  description: true,
  isActive: true,
});

export type CreateRolePayload = z.infer<typeof CreateRoleSchema>;

// UpdateRole
export const UpdateRoleSchema = RoleSchema.pick({
  name: true,
  description: true,
  isActive: true,
}).safeExtend({
  permissionIds: z.array(z.number()),
});

export type UpdateRolePayload = z.infer<typeof UpdateRoleSchema>;

// RoleParams
export const RoleParamsSchema = z.object({
  id: z.coerce.number(),
});

export type RoleParamsPayload = z.infer<typeof RoleParamsSchema>;

// RoleQuery
export const RoleQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
});

export type RoleQueryPayload = z.infer<typeof RoleQuerySchema>;

// RoleResponse
export const RoleResponseSchema = RoleSchema;

export type RoleResponsePayload = z.infer<typeof RoleResponseSchema>;

// Role$PermissionsResponse
export const Role$PermissionsResponseSchema = Role$PermissionsSchema;

export type Role$PermissionsResponsePayload = z.infer<
  typeof Role$PermissionsResponseSchema
>;

// RoleListResponse
export const RoleListResponseSchema = z.object({
  data: z.array(RoleSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type RoleListResponsePayload = z.infer<typeof RoleListResponseSchema>;
