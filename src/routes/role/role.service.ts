import { Injectable } from '@nestjs/common';
import {
  CustomUnprocessableEntityException,
  isPrismaClientNotFoundError,
  isPrismaClientUniqueConstraintError,
  throwIfHttpException,
} from 'src/shared/helpers/helpers';
import {
  CreateRolePayload,
  RoleQueryPayload,
  UpdateRolePayload,
} from './role.model';
import { RoleRepository } from './role.repository';

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async list(pagination: RoleQueryPayload) {
    return await this.roleRepository.list(pagination);
  }

  async findById(id: number) {
    const role = await this.roleRepository.findById(id);

    if (!role) {
      throw new CustomUnprocessableEntityException([
        {
          message: 'Role không tồn tại',
          path: 'id',
        },
      ]);
    }

    return role;
  }

  async create({
    createRolePayload,
    createdById,
  }: {
    createRolePayload: CreateRolePayload;
    createdById: number;
  }) {
    try {
      return await this.roleRepository.create({
        createRolePayload,
        createdById,
      });
    } catch (error) {
      throwIfHttpException(error);

      if (isPrismaClientUniqueConstraintError(error)) {
        throw new CustomUnprocessableEntityException([
          {
            message: 'Role với tên này đã tồn tại',
            path: 'name',
          },
        ]);
      }

      throw error;
    }
  }

  async update({
    id,
    updateRolePayload,
    updatedById,
  }: {
    id: number;
    updateRolePayload: UpdateRolePayload;
    updatedById: number;
  }) {
    try {
      return await this.roleRepository.update({
        id,
        updateRolePayload,
        updatedById,
      });
    } catch (error) {
      throwIfHttpException(error);

      if (isPrismaClientNotFoundError(error)) {
        throw new CustomUnprocessableEntityException([
          {
            message: 'Role không tồn tại',
            path: 'id',
          },
        ]);
      }

      if (isPrismaClientUniqueConstraintError(error)) {
        throw new CustomUnprocessableEntityException([
          {
            message: 'Role với tên này đã tồn tại',
            path: 'name',
          },
        ]);
      }

      throw error;
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.roleRepository.delete({
        id,
        deletedById,
      });

      return { message: 'Xoá role thành công' };
    } catch (error) {
      throwIfHttpException(error);

      if (isPrismaClientNotFoundError(error)) {
        throw new CustomUnprocessableEntityException([
          {
            message: 'Role không tồn tại',
            path: 'id',
          },
        ]);
      }

      throw error;
    }
  }
}
