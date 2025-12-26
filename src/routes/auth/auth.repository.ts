import { Injectable } from '@nestjs/common';
import { VerificationCodeKind } from 'src/generated/prisma/enums';
import { UserPayload } from 'src/shared/models/shared-user.model';
import { PrismaService } from 'src/shared/services/prisma.service';
import z from 'zod';
import {
  CreateDevicePayload,
  CreateDeviceSchema,
  CreateRefreshTokenPayload,
  CreateRefreshTokenSchema,
  CreateUserPayload,
  CreateUserSchema,
  CreateVerificationCodePayload,
  CreateVerificationCodeSchema,
  DevicePayload,
  RefreshToken$User$RolePayload,
  RefreshTokenPayload,
  UpdateDevicePayload,
  UpdateDeviceSchema,
  UpdateUserPayload,
  UpdateUserSchema,
  User$RolePayload,
  VerificationCodePayload,
} from './auth.model';

// FindUniqueUser$Role
const FindUniqueUser$RoleSchema = z.union([
  z.object({ id: z.number() }),
  z.object({ email: z.email() }),
]);

type FindUniqueUser$RolePayload = z.infer<typeof FindUniqueUser$RoleSchema>;

// ----------------------------------------------------------------------------------------------------

// FindUniqueVerificationCode
const FindUniqueVerificationCodeSchema = z.union([
  z.object({
    email_code_type: z.object({
      email: z.email(),
      code: z.string(),
      type: z.enum(VerificationCodeKind),
    }),
  }),
  z.object({ id: z.number() }),
]);

type FindUniqueVerificationCodePayload = z.infer<
  typeof FindUniqueVerificationCodeSchema
>;

// DeleteVerificationCode
const DeleteVerificationCodeSchema = FindUniqueVerificationCodeSchema;

type DeleteVerificationCodePayload = z.infer<
  typeof DeleteVerificationCodeSchema
>;

// ----------------------------------------------------------------------------------------------------

// FindUniqueRefreshToken
const FindUniqueRefreshTokenSchema = z.object({
  token: z.string(),
});

type FindUniqueRefreshTokenPayload = z.infer<
  typeof FindUniqueRefreshTokenSchema
>;

// DeleteRefreshToken
const DeleteRefreshTokenSchema = FindUniqueRefreshTokenSchema;

type DeleteRefreshTokenPayload = z.infer<typeof DeleteRefreshTokenSchema>;

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(createUserPayload: CreateUserPayload): Promise<UserPayload> {
    const $createUserPayload = CreateUserSchema.parse(createUserPayload);

    return await this.prisma.user.create({
      data: $createUserPayload,
    });
  }

  async createUser$Role(
    createUserPayload: CreateUserPayload,
  ): Promise<User$RolePayload> {
    const $createUserPayload = CreateUserSchema.parse(createUserPayload);

    return await this.prisma.user.create({
      data: $createUserPayload,
      include: {
        role: true,
      },
    });
  }

  async findUniqueUser$Role(
    findUniqueUser$RolePayload: FindUniqueUser$RolePayload,
  ): Promise<User$RolePayload | null> {
    const $findUniqueUser$RoleSchema = FindUniqueUser$RoleSchema.parse(
      findUniqueUser$RolePayload,
    );

    return await this.prisma.user.findUnique({
      where: $findUniqueUser$RoleSchema,
      include: {
        role: true,
      },
    });
  }

  async updateUser(
    where: { id: number } | { email: string },
    updateUserPayload: UpdateUserPayload,
  ): Promise<UserPayload> {
    const $updateUserPayload = UpdateUserSchema.parse(updateUserPayload);

    return await this.prisma.user.update({
      where,
      data: $updateUserPayload,
    });
  }

  // ----------------------------------------------------------------------------------------------------

  async createOrUpdateVerificationCode(
    createVerificationCodePayload: CreateVerificationCodePayload,
  ): Promise<VerificationCodePayload> {
    const $createVerificationCodePayload = CreateVerificationCodeSchema.parse(
      createVerificationCodePayload,
    );

    const result = await this.prisma.$transaction(async (prisma) => {
      // Kiểm tra xem mã OTP đã tồn tại chưa
      const existingCode = await prisma.verificationCode.findFirst({
        where: {
          email: $createVerificationCodePayload.email,
          type: $createVerificationCodePayload.type,
        },
      });

      // Nếu tồn tại, cập nhật mã OTP và thời gian hết hạn
      if (existingCode) {
        return await prisma.verificationCode.update({
          where: { id: existingCode.id },
          data: {
            code: $createVerificationCodePayload.code,
            expiresAt: $createVerificationCodePayload.expiresAt,
          },
        });
      }

      // Nếu chưa tồn tại, tạo mới mã OTP
      return await prisma.verificationCode.create({
        data: $createVerificationCodePayload,
      });
    });

    return result;
  }

  async findUniqueVerificationCode(
    findUniqueVerificationCodePayload: FindUniqueVerificationCodePayload,
  ): Promise<VerificationCodePayload | null> {
    const $findUniqueVerificationCodePayload =
      FindUniqueVerificationCodeSchema.parse(findUniqueVerificationCodePayload);

    return await this.prisma.verificationCode.findUnique({
      where: $findUniqueVerificationCodePayload,
    });
  }

  async deleteVerificationCode(
    deleteVerificationCodePayload: DeleteVerificationCodePayload,
  ): Promise<VerificationCodePayload> {
    const $deleteVerificationCodePayload = DeleteVerificationCodeSchema.parse(
      deleteVerificationCodePayload,
    );

    return await this.prisma.verificationCode.delete({
      where: $deleteVerificationCodePayload,
    });
  }

  // ----------------------------------------------------------------------------------------------------

  async createRefreshToken(
    createRefreshTokenPayload: CreateRefreshTokenPayload,
  ): Promise<RefreshTokenPayload> {
    const $createRefreshTokenPayload = CreateRefreshTokenSchema.parse(
      createRefreshTokenPayload,
    );

    return await this.prisma.refreshToken.create({
      data: $createRefreshTokenPayload,
    });
  }

  async findUniqueRefreshToken$User$Role(
    findUniqueRefreshTokenPayload: FindUniqueRefreshTokenPayload,
  ): Promise<RefreshToken$User$RolePayload | null> {
    const $findUniqueRefreshTokenPayload = FindUniqueRefreshTokenSchema.parse(
      findUniqueRefreshTokenPayload,
    );

    return await this.prisma.refreshToken.findUnique({
      where: $findUniqueRefreshTokenPayload,
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async deleteRefreshToken(
    deleteRefreshTokenPayload: DeleteRefreshTokenPayload,
  ): Promise<RefreshTokenPayload> {
    const $deleteRefreshTokenPayload = DeleteRefreshTokenSchema.parse(
      deleteRefreshTokenPayload,
    );

    return await this.prisma.refreshToken.delete({
      where: $deleteRefreshTokenPayload,
    });
  }

  // ----------------------------------------------------------------------------------------------------

  async createDevice(
    createDevicePayload: CreateDevicePayload,
  ): Promise<DevicePayload> {
    const $createDevicePayload = CreateDeviceSchema.parse(createDevicePayload);

    return await this.prisma.device.create({
      data: $createDevicePayload,
    });
  }

  async updateDevice(
    deviceId: number,
    updateDevicePayload: UpdateDevicePayload,
  ): Promise<DevicePayload> {
    const $updateDevicePayload = UpdateDeviceSchema.parse(updateDevicePayload);

    return await this.prisma.device.update({
      where: { id: deviceId },
      data: $updateDevicePayload,
    });
  }
}
