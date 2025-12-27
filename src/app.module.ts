import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './routes/auth/auth.module';
import { LanguageModule } from './routes/language/language.module';
import { PermissionModule } from './routes/permission/permission.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [SharedModule, AuthModule, LanguageModule, PermissionModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
