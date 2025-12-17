import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  CreateUserType,
  CreateVerificationCodeType,
  RegisterResType,
  VerificationCodeType,
} from './auth.model';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserData: CreateUserType): Promise<RegisterResType> {
    return this.prisma.user.create({
      data: createUserData,
      omit: {
        password: true,
        totpSecret: true,
      },
    });
  }

  async createOrUpdateVerificationCode(
    createVerificationCodeData: CreateVerificationCodeType,
  ): Promise<VerificationCodeType> {
    return this.prisma.verificationCode.upsert({
      where: { email: createVerificationCodeData.email },
      update: createVerificationCodeData,
      create: createVerificationCodeData,
    });
  }
}
