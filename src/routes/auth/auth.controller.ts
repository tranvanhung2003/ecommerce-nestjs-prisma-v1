import { Body, Controller, Ip, Post } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { UserAgent } from 'src/shared/decorators/user-agent.decorator';
import {
  LoginDto,
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
  login(
    @Body() loginDto: LoginDto,
    @UserAgent() userAgent: string,
    @Ip() ip: string,
  ) {
    return this.authService.login({ ...loginDto, userAgent, ip });
  }

  // @Post('refresh-token')
  // @HttpCode(HttpStatus.OK)
  // refreshToken(@Body() refreshTokenDto: any) {
  //   return this.authService.refreshToken(refreshTokenDto);
  // }

  // @Post('logout')
  // async logout(@Body() logoutDto: any) {
  //   return this.authService.logout(logoutDto);
  // }
}
