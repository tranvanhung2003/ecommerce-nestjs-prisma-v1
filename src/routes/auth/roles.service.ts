import { Injectable, OnModuleInit } from '@nestjs/common';
import { RoleName } from 'src/shared/constants/role.constant';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class RolesService implements OnModuleInit {
  private clientRoleId: number;

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.initializeClientRoleId();
  }

  private async initializeClientRoleId() {
    const clientRole = await this.prisma.role.findUniqueOrThrow({
      where: {
        name: RoleName.CLIENT,
      },
    });

    this.clientRoleId = clientRole.id;
  }

  getClientRoleId() {
    return this.clientRoleId;
  }
}
