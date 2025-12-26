import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  CreateLanguagePayload,
  CreateLanguageSchema,
  LanguagePayload,
  UpdateLanguagePayload,
  UpdateLanguageSchema,
} from './models/language.model';

@Injectable()
export class LanguagesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createLanguagePayload: CreateLanguagePayload,
  ): Promise<LanguagePayload> {
    const $createLanguagePayload = CreateLanguageSchema.parse(
      createLanguagePayload,
    );

    return await this.prisma.language.create({
      data: $createLanguagePayload,
    });
  }

  async findAll(): Promise<LanguagePayload[]> {
    return await this.prisma.language.findMany();
  }

  async findUnique(id: string): Promise<LanguagePayload | null> {
    return await this.prisma.language.findUnique({
      where: { id },
    });
  }

  async update(
    id: string,
    updateLanguagePayload: UpdateLanguagePayload,
  ): Promise<LanguagePayload> {
    const $updateLanguagePayload = UpdateLanguageSchema.parse(
      updateLanguagePayload,
    );

    return await this.prisma.language.update({
      where: { id },
      data: $updateLanguagePayload,
    });
  }

  async delete(id: string): Promise<LanguagePayload> {
    return await this.prisma.language.delete({
      where: { id },
    });
  }
}
