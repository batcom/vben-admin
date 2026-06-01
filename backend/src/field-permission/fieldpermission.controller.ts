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
import { FieldpermissionService } from './fieldpermission.service';

@Controller('field-permission')
export class FieldpermissionController {
  constructor(private fieldpermissionService: FieldpermissionService) {}

  @Get()
  @RequirePermission('field:permission:list')
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.fieldpermissionService.findAll({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      keyword,
    });
  }

  @Get(':id')
  @RequirePermission('field:permission:query')
  findOne(@Param('id') id: string) {
    return this.fieldpermissionService.findOne(parseInt(id, 10));
  }

  @Post()
  @RequirePermission('field:permission:create')
  create(@Body() data: any) {
    return this.fieldpermissionService.create(data);
  }

  @Put(':id')
  @RequirePermission('field:permission:update')
  update(@Param('id') id: string, @Body() data: any) {
    return this.fieldpermissionService.update(parseInt(id, 10), data);
  }

  @Delete(':id')
  @RequirePermission('field:permission:delete')
  remove(@Param('id') id: string) {
    return this.fieldpermissionService.remove(parseInt(id, 10));
  }
}
