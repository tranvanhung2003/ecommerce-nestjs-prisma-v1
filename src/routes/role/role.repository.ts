import { Injectable } from '@nestjs/common';
import { RolePayload } from 'src/shared/models/shared-role.model';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  CreateRolePayload,
  Role$PermissionsPayload,
  RoleListResponsePayload,
  RoleQueryPayload,
  UpdateRolePayload,
} from './role.model';

@Injectable()
export class RoleRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(pagination: RoleQueryPayload): Promise<RoleListResponsePayload> {
    const skip = (pagination.page - 1) * pagination.limit;
    const take = pagination.limit;

    const [data, totalItems] = await Promise.all([
      this.prisma.role.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take,
      }),

      this.prisma.role.count({
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

  async findById(id: number): Promise<Role$PermissionsPayload | null> {
    return await this.prisma.role.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        permissions: true,
      },
    });
  }

  async create({
    createRolePayload,
    createdById,
  }: {
    createRolePayload: CreateRolePayload;
    createdById: number;
  }): Promise<RolePayload> {
    return await this.prisma.role.create({
      data: {
        ...createRolePayload,
        createdById,
      },
    });
  }

  async update({
    id,
    updateRolePayload,
    updatedById,
  }: {
    id: number;
    updateRolePayload: UpdateRolePayload;
    updatedById: number;
  }): Promise<Role$PermissionsPayload> {
    return await this.prisma.role.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        name: updateRolePayload.name,
        description: updateRolePayload.description,
        isActive: updateRolePayload.isActive,
        permissions: {
          set: updateRolePayload.permissionIds.map((id) => ({ id })),
        },
        updatedById,
      },
      include: {
        permissions: true,
      },
    });
  }

  async delete(
    {
      id,
      deletedById,
    }: {
      id: number;
      deletedById: number;
    },
    isHardDelete?: boolean,
  ): Promise<RolePayload> {
    if (isHardDelete) {
      return await this.prisma.role.delete({
        where: {
          id,
        },
      });
    } else {
      return await this.prisma.role.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          deletedById,
        },
      });
    }
  }
}
