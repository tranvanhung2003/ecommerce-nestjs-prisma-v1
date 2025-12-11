import { UnprocessableEntityException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';

type ZodValidationPipeClass = ReturnType<typeof createZodValidationPipe>;

export const CustomZodValidationPipe: ZodValidationPipeClass =
  createZodValidationPipe({
    createValidationException: (error: ZodError) =>
      new UnprocessableEntityException('Ooops'),
  });
