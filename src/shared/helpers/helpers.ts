import {
  HttpExceptionOptions,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';

export type CustomErrors = {
  field: string;
  error: string;
}[];

export class CustomUnprocessableEntityException extends UnprocessableEntityException {
  constructor(
    objectOrError?: CustomErrors,
    descriptionOrOptions?: string | HttpExceptionOptions,
  ) {
    super(objectOrError, descriptionOrOptions);
  }
}

export function isPrismaClientKnownRequestError(
  error: any,
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

export function isPrismaClientUniqueConstraintError(
  error: Prisma.PrismaClientKnownRequestError,
) {
  return error.code === 'P2002';
}

export function isPrismaClientNotFoundError(
  error: Prisma.PrismaClientKnownRequestError,
) {
  return error.code === 'P2025';
}
