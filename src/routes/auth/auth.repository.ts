import { Injectable } from '@nestjs/common';
import { VerificationCodeKind } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/shared/services/prisma.service';
import z from 'zod';
import {
  CreateUserPayload,
  CreateUserSchema,
  CreateVerificationCodePayload,
  CreateVerificationCodeSchema,
  RegisterResPayload,
  VerificationCodePayload,
} from './auth.model';

const FindUniqueSchema = z.union([
  z.object({
    email: z.email(),
    code: z.string(),
    type: z.enum(VerificationCodeKind),
  }),
  z.object({ id: z.number() }),
  z.object({ email: z.email() }),
]);

type FindUniquePayload = z.infer<typeof FindUniqueSchema>;

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(
    createUserPayload: CreateUserPayload,
  ): Promise<RegisterResPayload> {
    const $createUserPayload = CreateUserSchema.parse(createUserPayload);

    return this.prisma.user.create({
      data: $createUserPayload,
      omit: {
        password: true,
        totpSecret: true,
      },
    });
  }

  async createOrUpdateVerificationCode(
    createVerificationCodePayload: CreateVerificationCodePayload,
  ): Promise<VerificationCodePayload> {
    const $createVerificationCodePayload = CreateVerificationCodeSchema.parse(
      createVerificationCodePayload,
    );

    return this.prisma.verificationCode.upsert({
      where: { email: $createVerificationCodePayload.email },
      update: $createVerificationCodePayload,
      create: $createVerificationCodePayload,
    });
  }

  async findUniqueVerificationCode(
    findUniquePayload: FindUniquePayload,
  ): Promise<VerificationCodePayload | null> {
    const $findUniquePayload = FindUniqueSchema.parse(findUniquePayload);

    return this.prisma.verificationCode.findUnique({
      where: $findUniquePayload,
    });
  }
}
