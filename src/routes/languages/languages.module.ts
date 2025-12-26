import { Module } from '@nestjs/common';
import { LanguagesController } from './languages.controller';
import { LanguagesRepository } from './languages.repository';
import { LanguagesService } from './languages.service';

@Module({
  controllers: [LanguagesController],
  providers: [LanguagesService, LanguagesRepository],
})
export class LanguagesModule {}
