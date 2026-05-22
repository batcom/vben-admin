import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RequirePermission } from '../common/decorators/permission.decorator';
import { RolesService } from './roles.service';

@UseGuards(AuthGuard('jwt'))
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @RequirePermission('role:list')
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
  ) {
    return this.rolesService.findAll({
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
      keyword,
      status: status ? parseInt(status, 10) : undefined,
    });
  }

  @Get(':id')
  @RequirePermission('role:query')
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(parseInt(id, 10));
  }

  @Post()
  @RequirePermission('role:create')
  create(@Body() data: any) {
    return this.rolesService.create(data);
  }

  @Put(':id')
  @RequirePermission('role:update')
  update(@Param('id') id: string, @Body() data: any) {
    return this.rolesService.update(parseInt(id, 10), data);
  }

  @Delete(':id')
  @RequirePermission('role:delete')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(parseInt(id, 10));
  }
}
