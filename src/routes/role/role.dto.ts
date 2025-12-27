import { createZodDto } from 'nestjs-zod';
import {
  CreateRoleSchema,
  Role$PermissionsResponseSchema,
  RoleListResponseSchema,
  RoleParamsSchema,
  RoleQuerySchema,
  RoleResponseSchema,
  UpdateRoleSchema,
} from './role.model';

export class CreateRoleDto extends createZodDto(CreateRoleSchema.strict()) {}

export class UpdateRoleDto extends createZodDto(UpdateRoleSchema.strict()) {}

export class RoleParamsDto extends createZodDto(RoleParamsSchema.strict()) {}

export class RoleQueryDto extends createZodDto(RoleQuerySchema.strict()) {}

export class RoleResponseDto extends createZodDto(RoleResponseSchema) {}

export class Role$PermissionsResponseDto extends createZodDto(
  Role$PermissionsResponseSchema,
) {}

export class RoleListResponseDto extends createZodDto(RoleListResponseSchema) {}
