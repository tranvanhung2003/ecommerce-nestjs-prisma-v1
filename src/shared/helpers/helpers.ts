import {
  HttpException,
  HttpExceptionOptions,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { Prisma } from 'src/generated/prisma/client';

export function assertNever(_x: never): never {
  throw new Error('This code path should never be reached.');
}

export function exists<T>(value: T | null | undefined): value is T {
  return value != null;
}

export function notExists<T>(
  value: T | null | undefined,
): value is null | undefined {
  return value == null;
}

export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export function isUndefined<T>(value: T | undefined): value is undefined {
  return value === undefined;
}

export function isNull<T>(value: T | null): value is null {
  return value === null;
}

export function isNotNull<T>(value: T | null): value is T {
  return value !== null;
}

// ----------------------------------------------------------------------------------------------------

type PropertyKey = string | number | symbol;

interface CustomError {
  message: string;
  path: string | PropertyKey[];
}

export class CustomUnprocessableEntityException extends UnprocessableEntityException {
  constructor(
    objectOrError?: CustomError[],
    descriptionOrOptions?: string | HttpExceptionOptions,
  ) {
    super(objectOrError, descriptionOrOptions);
  }
}

// ----------------------------------------------------------------------------------------------------

function isPrismaClientKnownRequestError(error: any) {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

export function isPrismaClientUniqueConstraintError(error: any) {
  return isPrismaClientKnownRequestError(error) && error.code === 'P2002';
}

export function isPrismaClientNotFoundError(error: any) {
  return isPrismaClientKnownRequestError(error) && error.code === 'P2025';
}

// ----------------------------------------------------------------------------------------------------

export function isHttpException(error: any) {
  return error instanceof HttpException;
}

export function throwIfHttpException(error: any) {
  if (isHttpException(error)) {
    throw error;
  }
}

// ----------------------------------------------------------------------------------------------------

export function generateOtp() {
  return randomInt(100000, 1000000).toString();
}
