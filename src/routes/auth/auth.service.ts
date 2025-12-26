import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
import { TwoFactorAuthService } from 'src/shared/services/two-factor-auth.service';
import {
  InputAccessTokenPayload,
  OutputAccessTokenPayload,
} from 'src/shared/types/jwt.type';
import {
  DoRefreshTokenPayload,
  ForgotPasswordPayload,
  LoginPayload,
  LogoutPayload,
  RegisterPayload,
  SendOtpPayload,
  ValidateVerificationCodePayload,
} from './auth.model';
import { AuthRepository } from './auth.repository';
import { RolesService } from './roles.service';

type LoginSuccessByOtp =
  | { success: false; code: '' }
  | { success: true; code: string };

@Injectable()
export class AuthService {
  constructor(
    private readonly rolesService: RolesService,
    private readonly authRepository: AuthRepository,
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly sharedUserRepository: SharedUserRepository,
    private readonly emailService: EmailService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  async register(registerPayload: RegisterPayload) {
    try {
      await this.validateVerificationCode({
        email: registerPayload.email,
        code: registerPayload.code,
        type: VerificationCodeKind.REGISTER,
      });

      const clientRoleId = this.rolesService.getClientRoleId();

      const hashedPassword = await this.hashingService.hash(
        registerPayload.password,
      );

      const { confirmPassword, code, ...$registerPayload } = registerPayload;

      const [user, _] = await Promise.all([
        // Tạo user mới
        this.authRepository.createUser$Role({
          ...$registerPayload,
          password: hashedPassword,
          avatar: null,
          roleId: clientRoleId,
        }),

        // Xóa mã OTP đã sử dụng
        this.authRepository.deleteVerificationCode({
          email_code_type: {
            email: registerPayload.email,
            code: registerPayload.code,
            type: VerificationCodeKind.REGISTER,
          },
        }),
      ]);

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

  async validateVerificationCode(
    validateVerificationCodePayload: ValidateVerificationCodePayload,
  ) {
    const verificationCode =
      await this.authRepository.findUniqueVerificationCode({
        email_code_type: validateVerificationCodePayload,
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

    return verificationCode;
  }

  async sendOtp(sendOtpPayload: SendOtpPayload) {
    const { email, type } = sendOtpPayload;

    const existUser = await this.sharedUserRepository.findUnique({
      email,
    });

    // Nếu là gửi OTP để đăng ký thì kiểm tra email đã tồn tại chưa
    if (type === VerificationCodeKind.REGISTER && existUser) {
      throw new CustomUnprocessableEntityException([
        {
          message: 'Email đã tồn tại',
          path: 'email',
        },
      ]);
    }

    // Nếu là gửi OTP để quên mật khẩu hoặc đăng nhập thì kiểm tra email có tồn tại không
    if (
      (type === VerificationCodeKind.FORGOT_PASSWORD ||
        type === VerificationCodeKind.LOGIN) &&
      !existUser
    ) {
      throw new CustomUnprocessableEntityException([
        {
          message: 'Email không tồn tại',
          path: 'email',
        },
      ]);
    }

    const otpCode = generateOtp();

    await this.authRepository.createOrUpdateVerificationCode({
      email: sendOtpPayload.email,
      code: otpCode,
      type: sendOtpPayload.type,
      expiresAt: addMilliseconds(
        new Date(),
        ms(envConfig.OTP_EXPIRES_IN as ms.StringValue),
      ),
    });

    const { error } = await this.emailService.sendOtp({
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

    return { message: 'Gửi mã OTP thành công' };
  }

  async login(
    compositePayload: LoginPayload & {
      userAgent: string;
      ip: string;
      user: OutputAccessTokenPayload;
    },
  ) {
    // Kiểm tra user đã đăng nhập chưa, nếu rồi thì không cho đăng nhập nữa,
    if (compositePayload.user) {
      throw new BadRequestException('Người dùng đã đăng nhập rồi');
    }

    // Lấy thông tin user, kiểm tra user có tồn tại không, mật khẩu có đúng không
    const user = await this.authRepository.findUniqueUser$Role({
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

    // Đặt flag kiểm tra đăng nhập thành công bằng mã OTP
    // Nếu user đăng nhập bằng mã OTP (email) thành công thì xóa mã OTP đã sử dụng
    let loginSuccessByOtp: LoginSuccessByOtp = { success: false, code: '' };

    // Nếu user đã kích hoạt 2FA thì kiểm tra mã 2FA TOTP hoặc mã OTP (email)
    if (user.totpSecret) {
      const { totpCode, code } = compositePayload;

      // Nếu không có mã 2FA TOTP hoặc mã OTP (email) thì báo lỗi
      if (!totpCode && !code) {
        throw new CustomUnprocessableEntityException([
          {
            message: 'Vui lòng nhập mã xác thực 2FA',
            path: 'totpCode',
          },
          {
            message: 'Vui lòng nhập mã OTP',
            path: 'code',
          },
        ]);
      }

      // Nếu có mã 2FA TOTP thì kiểm tra mã 2FA TOTP
      if (totpCode) {
        const isTotpCodeValid = this.twoFactorAuthService.verifyTotp({
          email: user.email,
          secret: user.totpSecret,
          token: totpCode,
        });

        if (!isTotpCodeValid) {
          throw new CustomUnprocessableEntityException([
            {
              message: 'Mã xác thực 2FA không đúng',
              path: 'totpCode',
            },
          ]);
        }
        // Nếu không có mã 2FA TOTP mà có mã OTP (email) thì kiểm tra mã OTP (email)
      } else if (code) {
        await this.validateVerificationCode({
          email: user.email,
          code,
          type: VerificationCodeKind.LOGIN,
        });

        loginSuccessByOtp = { success: true, code };
      }
    }

    // Tạo device
    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent: compositePayload.userAgent,
      ip: compositePayload.ip,
    });

    // Tạo cặp accessToken và refreshToken
    // Đồng thời nếu đăng nhập thành công bằng mã OTP (email) thì xóa mã OTP đã sử dụng
    const promiseTokens = this.generateTokens({
      userId: user.id,
      deviceId: device.id,
      roleId: user.roleId,
      roleName: user.role.name,
    });

    const promiseDeleteOtpCode = loginSuccessByOtp
      ? this.authRepository.deleteVerificationCode({
          email_code_type: {
            email: user.email,
            code: loginSuccessByOtp.code,
            type: VerificationCodeKind.LOGIN,
          },
        })
      : Promise.resolve(null);

    const [tokens, _] = await Promise.all([
      promiseTokens,
      promiseDeleteOtpCode,
    ]);

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
        await this.authRepository.findUniqueRefreshToken$User$Role({
          token: refreshToken,
        });

      if (!$refreshToken) {
        throw new UnauthorizedException('Refresh token đã bị thu hồi');
      }

      const {
        deviceId,
        user: {
          roleId,
          role: { name: roleName },
        },
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

  async forgotPassword(forgotPasswordPayload: ForgotPasswordPayload) {
    const { email, code, newPassword } = forgotPasswordPayload;

    // Kiểm tra email có tồn tại không
    const user = await this.sharedUserRepository.findUnique({ email });

    if (!user) {
      throw new CustomUnprocessableEntityException([
        {
          message: 'Email không tồn tại',
          path: 'email',
        },
      ]);
    }

    // Kiểm tra mã OTP có hợp lệ không
    await this.validateVerificationCode({
      email,
      code,
      type: VerificationCodeKind.FORGOT_PASSWORD,
    });

    // Hash mật khẩu mới
    const hashedNewPassword = await this.hashingService.hash(newPassword);

    await Promise.all([
      // Cập nhật mật khẩu mới cho user
      this.authRepository.updateUser(
        { id: user.id },
        { password: hashedNewPassword },
      ),

      // Xóa mã OTP đã sử dụng
      this.authRepository.deleteVerificationCode({
        email_code_type: {
          email,
          code,
          type: VerificationCodeKind.FORGOT_PASSWORD,
        },
      }),
    ]);

    return { message: 'Cập nhật mật khẩu mới thành công' };
  }

  async setupTwoFactorAuth(userId: number) {
    // Lấy thông tin user, kiểm tra user có tồn tại không, xem đã kích hoạt 2FA chưa
    const user = await this.sharedUserRepository.findUnique({ id: userId });

    if (!user) {
      throw new CustomUnprocessableEntityException([
        {
          message: 'Email không tồn tại',
          path: 'email',
        },
      ]);
    }

    if (user.totpSecret) {
      throw new CustomUnprocessableEntityException([
        {
          message: 'TOTP đã được kích hoạt trên tài khoản này',
          path: 'totpCode',
        },
      ]);
    }

    // Tạo secret và URI TOTP
    const { secret, uri } = this.twoFactorAuthService.generateTotpSecret(
      user.email,
    );

    // Cập nhật secret TOTP vào database
    await this.authRepository.updateUser(
      { id: userId },
      { totpSecret: secret },
    );

    // Trả về secret và URI TOTP
    return {
      secret,
      uri,
    };
  }
}
