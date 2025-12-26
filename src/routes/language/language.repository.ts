import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  CreateLanguagePayload,
  CreateLanguageSchema,
  LanguagePayload,
  UpdateLanguagePayload,
  UpdateLanguageSchema,
} from './language.model';

@Injectable()
export class LanguageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create({
    createLanguagePayload,
    createdById,
  }: {
    createLanguagePayload: CreateLanguagePayload;
    createdById: number;
  }): Promise<LanguagePayload> {
    const $createLanguagePayload = CreateLanguageSchema.parse(
      createLanguagePayload,
    );

    return await this.prisma.language.create({
      data: {
        ...$createLanguagePayload,
        createdById,
      },
    });
  }

  async findAll(): Promise<LanguagePayload[]> {
    return await this.prisma.language.findMany({
      where: {
        deletedAt: null,
      },
    });
  }

  async findById(id: string): Promise<LanguagePayload | null> {
    return await this.prisma.language.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async update({
    id,
    updateLanguagePayload,
    updatedById,
  }: {
    id: string;
    updateLanguagePayload: UpdateLanguagePayload;
    updatedById: number;
  }): Promise<LanguagePayload> {
    const $updateLanguagePayload = UpdateLanguageSchema.parse(
      updateLanguagePayload,
    );

    return await this.prisma.language.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...$updateLanguagePayload,
        updatedById,
      },
    });
  }

  async delete(id: string, isHardDelete?: boolean): Promise<LanguagePayload> {
    if (isHardDelete) {
      return await this.prisma.language.delete({
        where: { id },
      });
    } else {
      return await this.prisma.language.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      });
    }
  }
}
