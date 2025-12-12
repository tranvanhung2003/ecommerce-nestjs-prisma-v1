/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  CustomUnprocessableEntityException,
  isPrismaClientKnownRequestError,
  isPrismaClientNotFoundError,
  isPrismaClientUniqueConstraintError,
} from 'src/shared/helpers/helpers';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { TokenService } from 'src/shared/services/token.service';
import { EncodedPayload } from 'src/shared/types/jwt.type';
import { RolesService } from './roles.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly prisma: PrismaService,
    private readonly tokenService: TokenService,
    private readonly rolesService: RolesService,
  ) {}

  async register(registerDto: any) {
    try {
      const clientRoleId = this.rolesService.getClientRoleId();
      const hashedPassword = await this.hashingService.hash(
        registerDto.password,
      );
      const user = await this.prisma.user.create({
        data: {
          email: registerDto.email,
          password: hashedPassword,
          name: registerDto.name,
          phoneNumber: registerDto.phoneNumber,
          roleId: clientRoleId,
        },
        omit: {
          password: true,
          totpSecret: true,
        },
      });

      return user;
    } catch (error) {
      if (isPrismaClientKnownRequestError(error)) {
        if (isPrismaClientUniqueConstraintError(error)) {
          throw new ConflictException('Email already exists');
        }
      }

      throw new InternalServerErrorException('Lỗi máy chủ nội bộ');
    }
  }

  async login(loginDto: any) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Account does not exist');
    }

    const isPasswordValid = await this.hashingService.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new CustomUnprocessableEntityException([
        {
          field: 'password',
          error: 'Password is incorrect',
        },
      ]);
    }

    const tokens = await this.generateTokens({ userId: user.id });

    return tokens;
  }

  async generateTokens(encodedPayload: EncodedPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(encodedPayload),
      this.tokenService.signRefreshToken(encodedPayload),
    ]);
    const decodedRefreshToken =
      await this.tokenService.verifyRefreshToken(refreshToken);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: encodedPayload.userId,
        expiresAt: new Date(decodedRefreshToken.exp * 1000),
      },
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshTokenDto: any) {
    try {
      const { refreshToken } = refreshTokenDto;

      // Kiểm tra refreshToken có hợp lệ không
      const { userId } =
        await this.tokenService.verifyRefreshToken(refreshToken);

      // Kiểm tra refreshToken có tồn tại trong database không
      await this.prisma.refreshToken.findUniqueOrThrow({
        where: { token: refreshToken },
      });

      // Xóa refreshToken cũ
      await this.prisma.refreshToken.delete({
        where: { token: refreshToken },
      });

      // Tạo mới cặp accessToken và refreshToken
      return await this.generateTokens({ userId });
    } catch (error) {
      if (isPrismaClientKnownRequestError(error)) {
        if (isPrismaClientNotFoundError(error)) {
          throw new UnauthorizedException('Refresh token has been revoked');
        }
      }

      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(logoutDto: any) {
    try {
      const { refreshToken } = logoutDto;

      await this.tokenService.verifyRefreshToken(refreshToken);

      await this.prisma.refreshToken.delete({
        where: { token: refreshToken },
      });

      return { message: 'Logout successful' };
    } catch (error) {
      if (isPrismaClientKnownRequestError(error)) {
        if (isPrismaClientNotFoundError(error)) {
          throw new UnauthorizedException('Refresh token has been revoked');
        }
      }

      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
