import { Injectable } from '@nestjs/common';
import z from 'zod';
import { UserPayload } from '../models/shared-user.model';
import { PrismaService } from '../services/prisma.service';

const FindUniqueSchema = z.union([
  z.object({ id: z.number() }),
  z.object({ email: z.email() }),
]);

type FindUniquePayload = z.infer<typeof FindUniqueSchema>;

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    findUniquePayload: FindUniquePayload,
  ): Promise<UserPayload | null> {
    const $findUniquePayload = FindUniqueSchema.parse(findUniquePayload);

    return this.prisma.user.findUnique({
      where: $findUniquePayload,
    });
  }
}
