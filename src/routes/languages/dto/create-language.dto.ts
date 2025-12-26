import { createZodDto } from 'nestjs-zod';
import { CreateLanguageSchema } from '../models/language.model';

export class CreateLanguageDto extends createZodDto(
  CreateLanguageSchema.strict(),
) {}
