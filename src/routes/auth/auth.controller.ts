import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
} from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { UserAgent } from 'src/shared/decorators/user-agent.decorator';
import {
  DoRefreshTokenDto,
  DoRefreshTokenResponseDto,
  LoginDto,
  LoginResponseDto,
  RegisterDto,
  RegisterResponseDto,
  SendOtpDto,
} from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResponseDto)
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('otp')
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
  @ZodSerializerDto(DoRefreshTokenResponseDto)
  @HttpCode(HttpStatus.OK)
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

  // @Post('logout')
  // async logout(@Body() logoutDto: any) {
  //   return this.authService.logout(logoutDto);
  // }
}
