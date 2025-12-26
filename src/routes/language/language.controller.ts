import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { User } from 'src/shared/decorators/user.decorator';
import { MessageResponseDto } from 'src/shared/dtos/response.dto';
import {
  CreateLanguageDto,
  LanguageListResponseDto,
  LanguageParamsDto,
  LanguageResponseDto,
  UpdateLanguageDto,
} from './language.dto';
import { LanguageService } from './language.service';

@Controller('languages')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Post()
  @ZodSerializerDto(LanguageResponseDto)
  create(
    @Body() createLanguageDto: CreateLanguageDto,
    @User('userId') userId: number,
  ) {
    return this.languageService.create({
      createLanguagePayload: createLanguageDto,
      createdById: userId,
    });
  }

  @Get()
  @ZodSerializerDto(LanguageListResponseDto)
  findAll() {
    return this.languageService.findAll();
  }

  @Get(':id')
  @ZodSerializerDto(LanguageResponseDto)
  findById(@Param() params: LanguageParamsDto) {
    return this.languageService.findById(params.id);
  }

  @Put(':id')
  @ZodSerializerDto(LanguageResponseDto)
  update(
    @Param() params: LanguageParamsDto,
    @Body() updateLanguageDto: UpdateLanguageDto,
    @User('userId') userId: number,
  ) {
    return this.languageService.update({
      id: params.id,
      updateLanguagePayload: updateLanguageDto,
      updatedById: userId,
    });
  }

  @Delete(':id')
  @ZodSerializerDto(MessageResponseDto)
  delete(@Param() params: LanguageParamsDto) {
    return this.languageService.delete(params.id);
  }
}
