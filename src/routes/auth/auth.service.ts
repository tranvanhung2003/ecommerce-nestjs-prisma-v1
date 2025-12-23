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
  throwIfHttpException,
} from 'src/shared/helpers/helpers';
import { SharedUserRepository } from 'src/shared/repositories/shared-user.repository';
import { EmailService } from 'src/shared/services/email.service';
import { HashingService } from 'src/shared/services/hashing.service';
import { TokenService } from 'src/shared/services/token.service';
import { InputAccessTokenPayload } from 'src/shared/types/jwt.type';
import {
  DoRefreshTokenPayload,
  LoginPayload,
  LogoutPayload,
  RegisterPayload,
  SendOtpPayload,
} from './auth.model';
import { AuthRepository } from './auth.repository';
import { RolesService } from './roles.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly rolesService: RolesService,
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
      throwIfHttpException(error);

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

  async login(
    compositePayload: LoginPayload & { userAgent: string; ip: string },
  ) {
    const user = await this.authRepository.findUniqueUserIncludeRole({
      email: compositePayload.email,
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
      compositePayload.password,
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

    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent: compositePayload.userAgent,
      ip: compositePayload.ip,
    });

    const tokens = await this.generateTokens({
      userId: user.id,
      deviceId: device.id,
      roleId: user.roleId,
      roleName: user.role.name,
    });

    return tokens;
  }

  async generateTokens(inputAccessTokenPayload: InputAccessTokenPayload) {
    const inputRefreshTokenPayload = {
      userId: inputAccessTokenPayload.userId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(inputAccessTokenPayload),
      this.tokenService.signRefreshToken(inputRefreshTokenPayload),
    ]);

    const verifiedRefreshToken =
      await this.tokenService.verifyRefreshToken(refreshToken);

    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId: inputAccessTokenPayload.userId,
      deviceId: inputAccessTokenPayload.deviceId,
      expiresAt: new Date(verifiedRefreshToken.exp * 1000),
    });

    return { accessToken, refreshToken };
  }

  async refreshToken(
    doRefreshTokenPayload: DoRefreshTokenPayload & {
      userAgent: string;
      ip: string;
    },
  ) {
    try {
      const { refreshToken, userAgent, ip } = doRefreshTokenPayload;

      // Kiểm tra refreshToken có hợp lệ không
      const { userId } =
        await this.tokenService.verifyRefreshToken(refreshToken);

      // Kiểm tra refreshToken có tồn tại trong database không
      const $refreshToken =
        await this.authRepository.findUniqueRefreshTokenIncludeUserIncludeRole({
          token: refreshToken,
        });

      if (!$refreshToken) {
        throw new UnauthorizedException('Refresh token đã bị thu hồi');
      }

      const {
        deviceId,
        user: { roleId, name: roleName },
      } = $refreshToken;

      // Cập nhật device
      const promiseUpdateDevice = this.authRepository.updateDevice(deviceId, {
        userAgent,
        ip,
      });

      // Xóa refreshToken cũ
      const promiseDeleteRefreshToken = this.authRepository.deleteRefreshToken({
        token: refreshToken,
      });

      // Tạo mới cặp accessToken và refreshToken
      const promiseGenerateTokens = this.generateTokens({
        userId,
        deviceId,
        roleId,
        roleName,
      });

      const [_updateDevice, _deleteRefreshToken, tokens] = await Promise.all([
        promiseUpdateDevice,
        promiseDeleteRefreshToken,
        promiseGenerateTokens,
      ]);

      return tokens;
    } catch (error) {
      throwIfHttpException(error);

      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }

  async logout(logoutPayload: LogoutPayload) {
    try {
      const { refreshToken } = logoutPayload;

      // Kiểm tra refreshToken có hợp lệ không
      await this.tokenService.verifyRefreshToken(refreshToken);

      // Xóa refreshToken trong database
      const deletedRefreshToken = await this.authRepository.deleteRefreshToken({
        token: refreshToken,
      });

      // Cập nhật device thành không hoạt động
      await this.authRepository.updateDevice(deletedRefreshToken.deviceId, {
        isActive: false,
      });

      return { message: 'Đăng xuất thành công' };
    } catch (error) {
      throwIfHttpException(error);

      if (isPrismaClientNotFoundError(error)) {
        throw new UnauthorizedException('Refresh token đã bị thu hồi');
      }

      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }
}
