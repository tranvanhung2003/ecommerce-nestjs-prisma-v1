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
  CreateRoleDto,
  Role$PermissionsResponseDto,
  RoleListResponseDto,
  RoleParamsDto,
  RoleQueryDto,
  RoleResponseDto,
  UpdateRoleDto,
} from './role.dto';
import { RoleService } from './role.service';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ZodSerializerDto(RoleListResponseDto)
  list(@Query() query: RoleQueryDto) {
    return this.roleService.list(query);
  }

  @Get(':id')
  @ZodSerializerDto(Role$PermissionsResponseDto)
  findById(@Param() params: RoleParamsDto) {
    return this.roleService.findById(params.id);
  }

  @Post()
  @ZodSerializerDto(RoleResponseDto)
  create(@Body() createRoleDto: CreateRoleDto, @User('userId') userId: number) {
    return this.roleService.create({
      createRolePayload: createRoleDto,
      createdById: userId,
    });
  }

  @Put(':id')
  @ZodSerializerDto(Role$PermissionsResponseDto)
  update(
    @Param() params: RoleParamsDto,
    @Body() updateRoleDto: UpdateRoleDto,
    @User('userId') userId: number,
  ) {
    return this.roleService.update({
      id: params.id,
      updateRolePayload: updateRoleDto,
      updatedById: userId,
    });
  }

  @Delete(':id')
  @ZodSerializerDto(MessageResponseDto)
  delete(@Param() params: RoleParamsDto, @User('userId') userId: number) {
    return this.roleService.delete({
      id: params.id,
      deletedById: userId,
    });
  }
}
