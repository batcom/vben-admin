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
import { PermissionsService } from './permissions.service';

@UseGuards(AuthGuard('jwt'))
@Controller('permissions')
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @Get()
  @RequirePermission('permission:list')
  findAll(@Query('keyword') keyword?: string, @Query('menuId') menuId?: string) {
    return this.permissionsService.findAll({
      keyword,
      menuId: menuId ? parseInt(menuId, 10) : undefined,
    });
  }

  @Post()
  @RequirePermission('permission:create')
  create(@Body() data: any) {
    return this.permissionsService.create(data);
  }

  @Put(':id')
  @RequirePermission('permission:update')
  update(@Param('id') id: string, @Body() data: any) {
    return this.permissionsService.update(parseInt(id, 10), data);
  }

  @Delete(':id')
  @RequirePermission('permission:delete')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(parseInt(id, 10));
  }
}
