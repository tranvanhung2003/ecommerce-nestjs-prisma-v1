import { Injectable } from '@nestjs/common';
import { VerificationCodeKind } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  CreateUserSchema,
  CreateUserType,
  CreateVerificationCodeSchema,
  CreateVerificationCodeType,
  RegisterResType,
  VerificationCodeType,
} from './auth.model';

type FindUniqueArgs =
  | { id: number }
  | { email: string }
  | {
      email: string;
      code: string;
      type: VerificationCodeKind;
    };

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
    findUniqueArgs: FindUniqueArgs,
  ): Promise<VerificationCodeType | null> {
    return this.prisma.verificationCode.findUnique({
      where: findUniqueArgs,
    });
  }
}
