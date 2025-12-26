import { createZodDto } from 'nestjs-zod';
import { UpdateLanguageSchema } from '../models/language.model';

export class UpdateLanguageDto extends createZodDto(
  UpdateLanguageSchema.strict(),
) {}
