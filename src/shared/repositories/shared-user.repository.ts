import { Injectable } from '@nestjs/common';
import z from 'zod';
import { UserPayload } from '../models/shared-user.model';
import { PrismaService } from '../services/prisma.service';

// FindUniqueUser
export const FindUniqueUserSchema = z.union([
  z.object({ id: z.number() }),
  z.object({ email: z.email() }),
]);

export type FindUniqueUserPayload = z.infer<typeof FindUniqueUserSchema>;

@Injectable()
export class SharedUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    findUniqueUserPayload: FindUniqueUserPayload,
  ): Promise<UserPayload | null> {
    const $findUniqueUserPayload = FindUniqueUserSchema.parse(
      findUniqueUserPayload,
    );

    return this.prisma.user.findUnique({
      where: $findUniqueUserPayload,
    });
  }
}
