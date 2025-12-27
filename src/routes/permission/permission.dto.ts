import { createZodDto } from 'nestjs-zod';
import {
  CreatePermissionSchema,
  PermissionListResponseSchema,
  PermissionParamsSchema,
  PermissionQuerySchema,
  PermissionResponseSchema,
  UpdatePermissionSchema,
} from './permission.model';

export class CreatePermissionDto extends createZodDto(
  CreatePermissionSchema.strict(),
) {}

export class UpdatePermissionDto extends createZodDto(
  UpdatePermissionSchema.strict(),
) {}

export class PermissionParamsDto extends createZodDto(
  PermissionParamsSchema.strict(),
) {}

export class PermissionQueryDto extends createZodDto(
  PermissionQuerySchema.strict(),
) {}

export class PermissionResponseDto extends createZodDto(
  PermissionResponseSchema,
) {}

export class PermissionListResponseDto extends createZodDto(
  PermissionListResponseSchema,
) {}
