import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { RegisterBodyDto, RegisterResDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResDto)
  register(@Body() registerDto: RegisterBodyDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: any) {
    return this.authService.login(loginDto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  refreshToken(@Body() refreshTokenDto: any) {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('logout')
  async logout(@Body() logoutDto: any) {
    return this.authService.logout(logoutDto);
  }
}
