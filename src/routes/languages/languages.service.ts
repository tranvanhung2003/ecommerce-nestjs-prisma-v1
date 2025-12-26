import { Injectable } from '@nestjs/common';
import {
  CustomUnprocessableEntityException,
  isPrismaClientNotFoundError,
  isPrismaClientUniqueConstraintError,
  throwIfHttpException,
} from 'src/shared/helpers/helpers';
import { LanguagesRepository } from './languages.repository';
import {
  CreateLanguagePayload,
  UpdateLanguagePayload,
} from './models/language.model';

@Injectable()
export class LanguagesService {
  constructor(private readonly languagesRepository: LanguagesRepository) {}

  async create(createLanguagePayload: CreateLanguagePayload) {
    try {
      return await this.languagesRepository.create(createLanguagePayload);
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
    return await this.languagesRepository.findAll();
  }

  async findUnique(id: string) {
    return await this.languagesRepository.findUnique(id);
  }

  async update(id: string, updateLanguagePayload: UpdateLanguagePayload) {
    try {
      return await this.languagesRepository.update(id, updateLanguagePayload);
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
      return await this.languagesRepository.delete(id);
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
