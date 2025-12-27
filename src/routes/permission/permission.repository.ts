import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  CreatePermissionPayload,
  PermissionListResponsePayload,
  PermissionPayload,
  PermissionQueryPayload,
  UpdatePermissionPayload,
} from './permission.model';

@Injectable()
export class PermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    pagination: PermissionQueryPayload,
  ): Promise<PermissionListResponsePayload> {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;

    const [data, totalItems] = await Promise.all([
      this.prisma.permission.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take,
      }),

      this.prisma.permission.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    return {
      data,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
    };
  }

  async findById(id: number): Promise<PermissionPayload | null> {
    return await this.prisma.permission.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async create({
    createPermissionPayload,
    createdById,
  }: {
    createPermissionPayload: CreatePermissionPayload;
    createdById: number;
  }): Promise<PermissionPayload> {
    return await this.prisma.permission.create({
      data: {
        ...createPermissionPayload,
        createdById,
      },
    });
  }

  async update({
    id,
    updatePermissionPayload,
    updatedById,
  }: {
    id: number;
    updatePermissionPayload: UpdatePermissionPayload;
    updatedById: number;
  }): Promise<PermissionPayload> {
    return await this.prisma.permission.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...updatePermissionPayload,
        updatedById,
      },
    });
  }

  async delete(
    {
      id,
      deleteById,
    }: {
      id: number;
      deleteById: number;
    },
    isHardDelete?: boolean,
  ): Promise<PermissionPayload> {
    if (isHardDelete) {
      return await this.prisma.permission.delete({
        where: {
          id,
        },
      });
    } else {
      return await this.prisma.permission.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          deletedById: deleteById,
          deletedAt: new Date(),
        },
      });
    }
  }
}
