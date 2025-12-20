/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { VerificationCodeKind } from 'src/generated/prisma/enums';
import envConfig from 'src/shared/config';
import {
  CustomUnprocessableEntityException,
  generateOtp,
  isPrismaClientNotFoundError,
  isPrismaClientUniqueConstraintError,
} from 'src/shared/helpers/helpers';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repository';
import { EmailService } from 'src/shared/services/email.service';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { TokenService } from 'src/shared/services/token.service';
import { InputTokenPayload } from 'src/shared/types/jwt.type';
import { LoginPayload, RegisterPayload, SendOtpPayload } from './auth.model';
import { AuthRepository } from './auth.repository';
import { RolesService } from './roles.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly rolesService: RolesService,
    // TODO: xóa prisma trong tương lai
    private readonly prisma: PrismaService,
    private readonly authRepository: AuthRepository,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly emailService: EmailService,
  ) {}

  async register(registerPayload: RegisterPayload) {
    try {
      const verificationCode =
        await this.authRepository.findUniqueVerificationCode({
          email: registerPayload.email,
          code: registerPayload.code,
          type: VerificationCodeKind.REGISTER,
        });

      if (!verificationCode) {
        throw new CustomUnprocessableEntityException([
          {
            message: 'Mã OTP không hợp lệ',
            path: 'code',
          },
        ]);
      }

      if (verificationCode.expiresAt < new Date()) {
        throw new CustomUnprocessableEntityException([
          {
            message: 'Mã OTP đã hết hạn',
            path: 'code',
          },
        ]);
      }

      const clientRoleId = this.rolesService.getClientRoleId();

      const hashedPassword = await this.hashingService.hash(
        registerPayload.password,
      );

      const { confirmPassword, code, ...$registerPayload } = registerPayload;

      const user = await this.authRepository.createUser({
        ...$registerPayload,
        password: hashedPassword,
        roleId: clientRoleId,
      });

      return user;
    } catch (error) {
      if (isPrismaClientUniqueConstraintError(error)) {
        throw new CustomUnprocessableEntityException([
          {
            message: 'Email đã tồn tại',
            path: 'email',
          },
        ]);
      }

      throw error;
    }
  }

  async sendOtp(sendOtpPayload: SendOtpPayload) {
    const existUser = await this.sharedUserRepository.findUnique({
      email: sendOtpPayload.email,
    });

    if (existUser) {
      throw new CustomUnprocessableEntityException([
        {
          message: 'Email đã tồn tại',
          path: 'email',
        },
      ]);
    }

    const otpCode = generateOtp();

    const verificationCode =
      await this.authRepository.createOrUpdateVerificationCode({
        email: sendOtpPayload.email,
        code: otpCode,
        type: sendOtpPayload.type,
        expiresAt: addMilliseconds(
          new Date(),
          ms(envConfig.OTP_EXPIRES_IN as ms.StringValue),
        ),
      });

    const { data: _, error } = await this.emailService.sendOtp({
      email: sendOtpPayload.email,
      code: otpCode,
    });

    if (error) {
      throw new CustomUnprocessableEntityException([
        {
          message: 'Gửi mã OTP thất bại, vui lòng thử lại sau',
          path: 'code',
        },
      ]);
    }

    return verificationCode;
  }

  async login(loginPayload: LoginPayload) {
    const user = await this.sharedUserRepository.findUnique({
      email: loginPayload.email,
    });

    if (!user) {
      throw new CustomUnprocessableEntityException([
        {
          message: 'Email không tồn tại',
          path: 'email',
        },
      ]);
    }

    const isPasswordValid = await this.hashingService.compare(
      loginPayload.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new CustomUnprocessableEntityException([
        {
          message: 'Password không đúng',
          path: 'password',
        },
      ]);
    }

    const tokens = await this.generateTokens({ userId: user.id });

    return tokens;
  }

  async generateTokens(inputTokenPayload: InputTokenPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(inputTokenPayload),
      this.tokenService.signRefreshToken(inputTokenPayload),
    ]);

    const decodedRefreshToken =
      await this.tokenService.verifyRefreshToken(refreshToken);

    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId: inputTokenPayload.userId,
      deviceId: 4,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(refreshTokenPayload: any) {
    try {
      const { refreshToken } = refreshTokenPayload;

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
      if (isPrismaClientNotFoundError(error)) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(logoutPayload: any) {
    try {
      const { refreshToken } = logoutPayload;

      await this.tokenService.verifyRefreshToken(refreshToken);

      await this.prisma.refreshToken.delete({
        where: { token: refreshToken },
      });

      return { message: 'Logout successful' };
    } catch (error) {
      if (isPrismaClientNotFoundError(error)) {
        throw new UnauthorizedException('Refresh token has been revoked');
      }

      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
