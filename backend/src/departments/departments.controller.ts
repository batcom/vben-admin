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
import { DepartmentsService } from './departments.service';

@UseGuards(AuthGuard('jwt'))
@Controller('departments')
export class DepartmentsController {
  constructor(private departmentsService: DepartmentsService) {}

  @Get()
  @RequirePermission('dept:list')
  findTree(@Query('keyword') keyword?: string, @Query('status') status?: string) {
    return this.departmentsService.findTree({
      keyword,
      status: status ? parseInt(status, 10) : undefined,
    });
  }

  @Get(':id')
  @RequirePermission('dept:query')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(parseInt(id, 10));
  }

  @Post()
  @RequirePermission('dept:create')
  create(@Body() data: any) {
    return this.departmentsService.create(data);
  }

  @Put(':id')
  @RequirePermission('dept:update')
  update(@Param('id') id: string, @Body() data: any) {
    return this.departmentsService.update(parseInt(id, 10), data);
  }

  @Delete(':id')
  @RequirePermission('dept:delete')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(parseInt(id, 10));
  }
}
