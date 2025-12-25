import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { ZodSerializerDto } from 'nestjs-zod';
import envConfig from 'src/shared/config';
import { Auth, IsPublic } from 'src/shared/decorators/auth.decorator';
import { UserAgent } from 'src/shared/decorators/user-agent.decorator';
import { User } from 'src/shared/decorators/user.decorator';
import { MessageResponseDto } from 'src/shared/dtos/response.dto';
import type { OutputAccessTokenPayload } from 'src/shared/types/jwt.type';
import {
  DoRefreshTokenDto,
  DoRefreshTokenResponseDto,
  GetAuthorizationUrlResponseDto,
  LoginDto,
  LoginResponseDto,
  LogoutDto,
  RegisterDto,
  RegisterResponseDto,
  SendOtpDto,
} from './auth.dto';
import { AuthService } from './auth.service';
import { GoogleService } from './google.service';

@IsPublic()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

  @Post('register')
  @ZodSerializerDto(RegisterResponseDto)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('otp')
  @ZodSerializerDto(MessageResponseDto)
  sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto);
  }

  @Post('login')
  @IsPublic({ assignUser: true })
  @ZodSerializerDto(LoginResponseDto)
  login(
    @Body() loginDto: LoginDto,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
    @User() user: OutputAccessTokenPayload,
  ) {
    return this.authService.login({ ...loginDto, userAgent, ip, user });
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(DoRefreshTokenResponseDto)
  refreshToken(
    @Body() doRefreshTokenDto: DoRefreshTokenDto,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
  ) {
    return this.authService.refreshToken({
      ...doRefreshTokenDto,
      userAgent,
      ip,
    });
  }

  @Post('logout')
  @Auth()
  @ZodSerializerDto(MessageResponseDto)
  logout(@Body() logoutDto: LogoutDto) {
    return this.authService.logout(logoutDto);
  }

  @Get('google-link')
  @ZodSerializerDto(GetAuthorizationUrlResponseDto)
  getAuthorizationUrl(@UserAgent() userAgent: string, @Ip() ip: string) {
    return this.googleService.getAuthorizationUrl({ userAgent, ip });
  }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    const getVarName = (varObj: object) => Object.keys(varObj)[0];

    try {
      const result = await this.googleService.googleCallback({ code, state });

      const { accessToken, refreshToken } = result;
      const [accessTokenKey, refreshTokenKey] = [
        getVarName({ accessToken }),
        getVarName({ refreshToken }),
      ];
      const params = new URLSearchParams();
      params.append(accessTokenKey, accessToken);
      params.append(refreshTokenKey, refreshToken);

      const url = `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?${params.toString()}`;

      return res.redirect(url);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Đã xảy ra lỗi khi đăng nhập bằng Google, vui lòng thử lại bằng cách khác.';
      const errorMessageKey = getVarName({ errorMessage });
      const params = new URLSearchParams();
      params.append(errorMessageKey, errorMessage);

      const url = `${envConfig.GOOGLE_CLIENT_REDIRECT_URI}?${params.toString()}`;
      return res.redirect(url);
    }
  }
}
