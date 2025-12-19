import {
  HttpExceptionOptions,
  UnprocessableEntityException,
} from '@nestjs/common';
import { randomInt } from 'node:crypto';
import { Prisma } from 'src/generated/prisma/client';

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

function isPrismaClientKnownRequestError(
  error: any,
): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}

export function isPrismaClientUniqueConstraintError(
  error: any,
): error is Prisma.PrismaClientKnownRequestError {
  return isPrismaClientKnownRequestError(error) && error.code === 'P2002';
}

export function isPrismaClientNotFoundError(
  error: any,
): error is Prisma.PrismaClientKnownRequestError {
  return isPrismaClientKnownRequestError(error) && error.code === 'P2025';
}

export function generateOtp() {
  return randomInt(100000, 1000000).toString();
}

export function compileHtmlTemplate(
  htmlTemplate: string,
  variables: Record<string, string>,
) {
  // let compiledTemplate = htmlTemplate;
  // for (const [key, value] of Object.entries(variables)) {
  //   const placeholder = `{{${key}}}`;
  //   compiledTemplate = compiledTemplate.replaceAll(placeholder, value);
  // }
  // return compiledTemplate;
  return Object.entries(variables).reduce((compiledTemplate, [key, value]) => {
    const placeholder = `{{${key}}}`;

    return compiledTemplate.replaceAll(placeholder, value);
  }, htmlTemplate);
}
