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
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RequirePermission } from '../common/decorators/permission.decorator';
import { MenusService } from './menus.service';

@UseGuards(AuthGuard('jwt'))
@Controller('menu')
export class MenusController {
  constructor(private menusService: MenusService) {}

  @Get('all')
  async getAllMenus(@CurrentUser('id') userId: number) {
    return this.menusService.getAllMenus(userId);
  }

  @Get()
  @RequirePermission('menu:list')
  findTree(@Query('keyword') keyword?: string, @Query('status') status?: string) {
    return this.menusService.findTree({
      keyword,
      status: status ? parseInt(status, 10) : undefined,
    });
  }

  @Get(':id')
  @RequirePermission('menu:query')
  findOne(@Param('id') id: string) {
    return this.menusService.findOne(parseInt(id, 10));
  }

  @Post()
  @RequirePermission('menu:create')
  create(@Body() data: any) {
    return this.menusService.create(data);
  }

  @Put(':id')
  @RequirePermission('menu:update')
  update(@Param('id') id: string, @Body() data: any) {
    return this.menusService.update(parseInt(id, 10), data);
  }

  @Delete(':id')
  @RequirePermission('menu:delete')
  remove(@Param('id') id: string) {
    return this.menusService.remove(parseInt(id, 10));
  }
}
