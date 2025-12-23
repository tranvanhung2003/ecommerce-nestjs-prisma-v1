import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
} from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { Auth, IsPublic } from 'src/shared/decorators/auth.decorator';
import { UserAgent } from 'src/shared/decorators/user-agent.decorator';
import { MessageResponseDto } from 'src/shared/dtos/response.dto';
import {
  DoRefreshTokenDto,
  DoRefreshTokenResponseDto,
  LoginDto,
  LoginResponseDto,
  LogoutDto,
  RegisterDto,
  RegisterResponseDto,
  SendOtpDto,
} from './auth.dto';
import { AuthService } from './auth.service';

@IsPublic()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
  @ZodSerializerDto(LoginResponseDto)
  login(
    @Body() loginDto: LoginDto,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
  ) {
    return this.authService.login({ ...loginDto, userAgent, ip });
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
}
