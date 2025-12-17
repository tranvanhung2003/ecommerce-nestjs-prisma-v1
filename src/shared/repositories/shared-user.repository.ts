import { Injectable } from '@nestjs/common';
import { UserType } from '../models/shared-user.model';
import { PrismaService } from '../services/prisma.service';

type FindUniqueObject = { id: number } | { email: string };

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    findUniqueObject: FindUniqueObject,
  ): Promise<UserType | null> {
    return this.prisma.user.findUnique({
      where: findUniqueObject,
    });
  }
}
