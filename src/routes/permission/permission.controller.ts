import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { User } from 'src/shared/decorators/user.decorator';
import { MessageResponseDto } from 'src/shared/dtos/response.dto';
import {
  CreatePermissionDto,
  PermissionListResponseDto,
  PermissionParamsDto,
  PermissionQueryDto,
  PermissionResponseDto,
  UpdatePermissionDto,
} from './permission.dto';
import { PermissionService } from './permission.service';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @ZodSerializerDto(PermissionListResponseDto)
  list(@Query() query: PermissionQueryDto) {
    return this.permissionService.list(query);
  }

  @Get(':id')
  @ZodSerializerDto(PermissionResponseDto)
  findById(@Param() params: PermissionParamsDto) {
    return this.permissionService.findById(params.id);
  }

  @Post()
  @ZodSerializerDto(PermissionResponseDto)
  create(
    @Body() createPermissionDto: CreatePermissionDto,
    @User('userId') userId: number,
  ) {
    return this.permissionService.create({
      createPermissionPayload: createPermissionDto,
      createdById: userId,
    });
  }

  @Put(':id')
  @ZodSerializerDto(PermissionResponseDto)
  update(
    @Body() updatePermissionDto: UpdatePermissionDto,
    @Param() params: PermissionParamsDto,
    @User('userId') userId: number,
  ) {
    return this.permissionService.update({
      id: params.id,
      updatePermissionPayload: updatePermissionDto,
      updatedById: userId,
    });
  }

  @Delete(':id')
  @ZodSerializerDto(MessageResponseDto)
  delete(@Param() params: PermissionParamsDto, @User('userId') userId: number) {
    return this.permissionService.delete({ id: params.id, deleteById: userId });
  }
}
