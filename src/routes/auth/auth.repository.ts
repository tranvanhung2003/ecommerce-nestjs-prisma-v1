import { Injectable } from '@nestjs/common';
import { VerificationCodeKind } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/shared/services/prisma.service';
import z from 'zod';
import {
  CreateUserSchema,
  CreateUserType,
  CreateVerificationCodeSchema,
  CreateVerificationCodeType,
  RegisterResType,
  VerificationCodeType,
} from './auth.model';

const FindUniqueArgsSchema = z.union([
  z.object({
    email: z.email(),
    code: z.string(),
    type: z.enum(VerificationCodeKind),
  }),
  z.object({ id: z.number() }),
  z.object({ email: z.email() }),
]);

type FindUniqueArgsType = z.infer<typeof FindUniqueArgsSchema>;

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserData: CreateUserType): Promise<RegisterResType> {
    const $createUserData = CreateUserSchema.parse(createUserData);

    return this.prisma.user.create({
      data: $createUserData,
      omit: {
        password: true,
        totpSecret: true,
      },
    });
  }

  async createOrUpdateVerificationCode(
    createVerificationCodeData: CreateVerificationCodeType,
  ): Promise<VerificationCodeType> {
    const $createVerificationCodeData = CreateVerificationCodeSchema.parse(
      createVerificationCodeData,
    );

    return this.prisma.verificationCode.upsert({
      where: { email: $createVerificationCodeData.email },
      update: $createVerificationCodeData,
      create: $createVerificationCodeData,
    });
  }

  async findUniqueVerificationCode(
    findUniqueArgsData: FindUniqueArgsType,
  ): Promise<VerificationCodeType | null> {
    const $findUniqueArgsData = FindUniqueArgsSchema.parse(findUniqueArgsData);

    return this.prisma.verificationCode.findUnique({
      where: $findUniqueArgsData,
    });
  }
}
