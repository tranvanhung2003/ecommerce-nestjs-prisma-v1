import { Injectable } from '@nestjs/common';
import z from 'zod';
import { UserType } from '../models/shared-user.model';
import { PrismaService } from '../services/prisma.service';

const FindUniqueSchema = z.union([
  z.object({ id: z.number() }),
  z.object({ email: z.email() }),
]);

type FindUniqueType = z.infer<typeof FindUniqueSchema>;

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(findUniqueData: FindUniqueType): Promise<UserType | null> {
    const $findUniqueData = FindUniqueSchema.parse(findUniqueData);

    return this.prisma.user.findUnique({
      where: $findUniqueData,
    });
  }
}
