import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './routes/auth/auth.module';
import { SharedModule } from './shared/shared.module';
import { LanguagesModule } from './routes/languages/languages.module';

@Module({
  imports: [SharedModule, AuthModule, LanguagesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
