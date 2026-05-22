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
import { RequirePermission } from '../common/decorators/permission.decorator';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get()
  @RequirePermission('order:list')
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('keyword') keyword?: string,
    @Query('status') status?: string,
  ) {
    return this.ordersService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      keyword,
      status,
    });
  }

  @Get(':id')
  @RequirePermission('order:query')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(parseInt(id, 10));
  }

  @Post()
  @RequirePermission('order:create')
  create(@Body() data: any) {
    return this.ordersService.create(data);
  }

  @Put(':id')
  @RequirePermission('order:update')
  update(@Param('id') id: string, @Body() data: any) {
    return this.ordersService.update(parseInt(id, 10), data);
  }

  @Delete(':id')
  @RequirePermission('order:delete')
  remove(@Param('id') id: string) {
    return this.ordersService.remove(parseInt(id, 10));
  }
}
