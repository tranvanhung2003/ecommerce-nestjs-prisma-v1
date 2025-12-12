import { UnprocessableEntityException } from '@nestjs/common';
import { createZodValidationPipe, ZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';

export const CustomZodValidationPipe: typeof ZodValidationPipe =
  createZodValidationPipe({
    createValidationException: (error: ZodError) =>
      new UnprocessableEntityException(
        error.issues.map((issue) => ({ ...issue, path: issue.path.join('.') })),
      ),
  });
