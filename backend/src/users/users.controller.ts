import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { RequirePermission } from '../common/decorators/permission.decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @RequirePermission('user:list')
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
  ) {
    return this.usersService.findAll({
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
      keyword,
      status: status ? parseInt(status, 10) : undefined,
    });
  }

  @Get(':id')
  @RequirePermission('user:query')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(parseInt(id, 10));
  }

  @Post()
  @RequirePermission('user:create')
  async create(@Body() data: any) {
    return this.usersService.create(data);
  }

  @Put(':id')
  @RequirePermission('user:update')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.usersService.update(parseInt(id, 10), data);
  }

  @Delete(':id')
  @RequirePermission('user:delete')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id, 10));
  }
}
