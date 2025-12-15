import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { CreateUserType, RegisterResType } from './auth.model';

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
}
