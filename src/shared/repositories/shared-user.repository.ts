import { Injectable } from '@nestjs/common';
import z from 'zod';
import { UserType } from '../models/shared-user.model';
import { PrismaService } from '../services/prisma.service';

const FindUniqueArgsSchema = z.union([
  z.object({ id: z.number() }),
  z.object({ email: z.email() }),
]);

type FindUniqueArgsType = z.infer<typeof FindUniqueArgsSchema>;

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    findUniqueArgsData: FindUniqueArgsType,
  ): Promise<UserType | null> {
    const $findUniqueArgsData = FindUniqueArgsSchema.parse(findUniqueArgsData);

    return this.prisma.user.findUnique({
      where: $findUniqueArgsData,
    });
  }
}
