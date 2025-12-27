import { Injectable, OnModuleInit } from '@nestjs/common';
import { RoleName } from 'src/shared/constants/role.constant';
import { RolePayload } from 'src/shared/models/shared-role.model';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class RolesService implements OnModuleInit {
  private clientRoleId: number;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.initializeClientRoleId();
  }

  private async initializeClientRoleId() {
    const clientRole: RolePayload = await this.prisma.$queryRaw`
      SELECT * FROM "Role" WHERE name = ${RoleName.CLIENT} AND "deletedAt" IS NULL LIMIT 1;
    `.then((roles: RolePayload[]) => {
      if (roles.length === 0) {
        throw new Error(`Role có tên ${RoleName.CLIENT} không tồn tại.`);
      }

      return roles[0];
    });

    this.clientRoleId = clientRole.id;
  }

  getClientRoleId() {
    return this.clientRoleId;
  }
}
