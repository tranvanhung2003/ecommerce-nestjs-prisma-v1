import { Injectable } from '@nestjs/common';
import { UserType } from '../models/shared-user.model';
import { PrismaService } from '../services/prisma.service';

type FindUniqueArgs = { id: number } | { email: string };

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(findUniqueArgs: FindUniqueArgs): Promise<UserType | null> {
    return this.prisma.user.findUnique({
      where: findUniqueArgs,
    });
  }
}
