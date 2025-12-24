import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Query,
} from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
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
  googleCallback(@Query('code') code: string, @Query('state') state: string) {
    return this.googleService.googleCallback({ code, state });
  }
}
