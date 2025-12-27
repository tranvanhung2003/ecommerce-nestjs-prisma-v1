import { createZodDto } from 'nestjs-zod';
import {
  CreateLanguageSchema,
  LanguageListResponseSchema,
  LanguageParamsSchema,
  LanguageResponseSchema,
  UpdateLanguageSchema,
} from './language.model';

export class CreateLanguageDto extends createZodDto(
  CreateLanguageSchema.strict(),
) {}

export class UpdateLanguageDto extends createZodDto(
  UpdateLanguageSchema.strict(),
) {}

export class LanguageParamsDto extends createZodDto(
  LanguageParamsSchema.strict(),
) {}

export class LanguageResponseDto extends createZodDto(LanguageResponseSchema) {}

export class LanguageListResponseDto extends createZodDto(
  LanguageListResponseSchema,
) {}
