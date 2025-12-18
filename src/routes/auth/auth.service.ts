/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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
import { EncodedPayload } from 'src/shared/types/jwt.type';
import { RegisterType, SendOtpType } from './auth.model';
import { AuthRepository } from './auth.repository';
import { RolesService } from './roles.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly rolesService: RolesService,
    // todo: sẽ xóa prisma service sau khi hoàn thành refactor repository
    private readonly prisma: PrismaService,
    private readonly authRepository: AuthRepository,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly emailService: EmailService,
  ) {}

  async register(registerData: RegisterType) {
    try {
      const verificationCode =
        await this.authRepository.findUniqueVerificationCode({
          email: registerData.email,
          code: registerData.code,
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
        registerData.password,
      );

      const { confirmPassword, code, ...$registerData } = registerData;

      const user = await this.authRepository.createUser({
        ...$registerData,
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

  async sendOtp(sendOtpData: SendOtpType) {
    const existUser = await this.sharedUserRepository.findUnique({
      email: sendOtpData.email,
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
        email: sendOtpData.email,
        code: otpCode,
        type: sendOtpData.type,
        expiresAt: addMilliseconds(
          new Date(),
          ms(envConfig.OTP_EXPIRES_IN as ms.StringValue),
        ),
      });

    const { data: _, error } = await this.emailService.sendOtp({
      email: sendOtpData.email,
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

  async login(loginData: any) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginData.email },
    });

    if (!user) {
      throw new UnauthorizedException('Account does not exist');
    }

    const isPasswordValid = await this.hashingService.compare(
      loginData.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new CustomUnprocessableEntityException([
        {
          message: 'Password is incorrect',
          path: 'password',
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

  async refreshToken(refreshTokenData: any) {
    try {
      const { refreshToken } = refreshTokenData;

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

  async logout(logoutData: any) {
    try {
      const { refreshToken } = logoutData;

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
