import { createZodDto } from 'nestjs-zod';
import { CreateLanguageSchema, UpdateLanguageSchema } from './language.model';

export class CreateLanguageDto extends createZodDto(
  CreateLanguageSchema.strict(),
) {}

export class UpdateLanguageDto extends createZodDto(
  UpdateLanguageSchema.strict(),
) {}
