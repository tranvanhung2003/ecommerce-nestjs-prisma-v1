import { Injectable } from '@nestjs/common';
import {
  CustomUnprocessableEntityException,
  isPrismaClientNotFoundError,
  isPrismaClientUniqueConstraintError,
  throwIfHttpException,
} from 'src/shared/helpers/helpers';
import { CreateLanguagePayload, UpdateLanguagePayload } from './language.model';
import { LanguageRepository } from './language.repository';

@Injectable()
export class LanguageService {
  constructor(private readonly languageRepository: LanguageRepository) {}

  async create({
    createLanguagePayload,
    createdById,
  }: {
    createLanguagePayload: CreateLanguagePayload;
    createdById: number;
  }) {
    try {
      return await this.languageRepository.create({
        createLanguagePayload,
        createdById,
      });
    } catch (error) {
      throwIfHttpException(error);

      if (isPrismaClientUniqueConstraintError(error)) {
        throw new CustomUnprocessableEntityException([
          {
            message: 'Language ID đã tồn tại.',
            path: 'id',
          },
        ]);
      }

      throw error;
    }
  }

  async findAll() {
    const data = await this.languageRepository.findAll();

    return {
      data,
      totalItems: data.length,
    };
  }

  async findById(id: string) {
    const language = await this.languageRepository.findById(id);

    if (!language) {
      throw new CustomUnprocessableEntityException([
        {
          message: 'Language ID không tồn tại.',
          path: 'id',
        },
      ]);
    }

    return language;
  }

  async update({
    id,
    updateLanguagePayload,
    updatedById,
  }: {
    id: string;
    updateLanguagePayload: UpdateLanguagePayload;
    updatedById: number;
  }) {
    try {
      return await this.languageRepository.update({
        id,
        updateLanguagePayload,
        updatedById,
      });
    } catch (error) {
      throwIfHttpException(error);

      if (isPrismaClientNotFoundError(error)) {
        throw new CustomUnprocessableEntityException([
          {
            message: 'Language ID không tồn tại.',
            path: 'id',
          },
        ]);
      }

      throw error;
    }
  }

  async delete(id: string) {
    try {
      // Hard delete
      await this.languageRepository.delete(id, true);

      return { message: 'Xóa Language thành công.' };
    } catch (error) {
      throwIfHttpException(error);

      if (isPrismaClientNotFoundError(error)) {
        throw new CustomUnprocessableEntityException([
          {
            message: 'Language ID không tồn tại.',
            path: 'id',
          },
        ]);
      }

      throw error;
    }
  }
}
