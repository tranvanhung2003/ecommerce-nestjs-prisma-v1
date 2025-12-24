import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { AuthService } from './auth.service';
import { GoogleService } from './google.service';
import { RolesService } from './roles.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, RolesService, AuthRepository, GoogleService],
})
export class AuthModule {}
