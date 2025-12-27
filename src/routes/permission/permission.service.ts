import { Injectable } from '@nestjs/common';
import {
  CustomUnprocessableEntityException,
  isPrismaClientNotFoundError,
  isPrismaClientUniqueConstraintError,
  throwIfHttpException,
} from 'src/shared/helpers/helpers';
import {
  CreatePermissionPayload,
  PermissionQueryPayload,
  UpdatePermissionPayload,
} from './permission.model';
import { PermissionRepository } from './permission.repository';

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async list(pagination: PermissionQueryPayload) {
    return await this.permissionRepository.list(pagination);
  }

  async findById(id: number) {
    const permission = await this.permissionRepository.findById(id);

    if (!permission) {
      throw new CustomUnprocessableEntityException([
        {
          message: 'Permission không tồn tại',
          path: 'id',
        },
      ]);
    }

    return permission;
  }

  async create({
    createPermissionPayload,
    createdById,
  }: {
    createPermissionPayload: CreatePermissionPayload;
    createdById: number;
  }) {
    try {
      return await this.permissionRepository.create({
        createPermissionPayload,
        createdById,
      });
    } catch (error) {
      throwIfHttpException(error);

      if (isPrismaClientUniqueConstraintError(error)) {
        throw new CustomUnprocessableEntityException([
          {
            message: 'Permission đã tồn tại',
            path: 'path',
          },
          {
            message: 'Permission đã tồn tại',
            path: 'method',
          },
        ]);
      }

      throw error;
    }
  }

  async update({
    id,
    updatePermissionPayload,
    updatedById,
  }: {
    id: number;
    updatePermissionPayload: UpdatePermissionPayload;
    updatedById: number;
  }) {
    try {
      return await this.permissionRepository.update({
        id,
        updatePermissionPayload,
        updatedById,
      });
    } catch (error) {
      throwIfHttpException(error);

      if (isPrismaClientNotFoundError(error)) {
        throw new CustomUnprocessableEntityException([
          {
            message: 'Permission không tồn tại',
            path: 'id',
          },
        ]);
      }

      if (isPrismaClientUniqueConstraintError(error)) {
        throw new CustomUnprocessableEntityException([
          {
            message: 'Permission đã tồn tại',
            path: 'path',
          },
          {
            message: 'Permission đã tồn tại',
            path: 'method',
          },
        ]);
      }

      throw error;
    }
  }

  async delete({ id, deleteById }: { id: number; deleteById: number }) {
    try {
      await this.permissionRepository.delete({ id, deleteById });

      return {
        message: 'Xóa Permission thành công',
      };
    } catch (error) {
      throwIfHttpException(error);

      if (isPrismaClientNotFoundError(error)) {
        throw new CustomUnprocessableEntityException([
          {
            message: 'Permission không tồn tại',
            path: 'id',
          },
        ]);
      }

      throw error;
    }
  }
}
