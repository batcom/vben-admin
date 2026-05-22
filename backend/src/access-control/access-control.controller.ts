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
import { AccessControlService } from './access-control.service';

@UseGuards(AuthGuard('jwt'))
@Controller('access-control')
export class AccessControlController {
  constructor(private accessControlService: AccessControlService) {}

  @Get('api-permissions')
  @RequirePermission('api-permission:list')
  findApiPermissions(
    @Query('keyword') keyword?: string,
    @Query('method') method?: string,
  ) {
    return this.accessControlService.findApiPermissions({ keyword, method });
  }

  @Post('api-permissions')
  @RequirePermission('api-permission:create')
  createApiPermission(@Body() data: any) {
    return this.accessControlService.createApiPermission(data);
  }

  @Put('api-permissions/:id')
  @RequirePermission('api-permission:update')
  updateApiPermission(@Param('id') id: string, @Body() data: any) {
    return this.accessControlService.updateApiPermission(parseInt(id, 10), data);
  }

  @Delete('api-permissions/:id')
  @RequirePermission('api-permission:delete')
  removeApiPermission(@Param('id') id: string) {
    return this.accessControlService.removeApiPermission(parseInt(id, 10));
  }

  @Get('field-permissions')
  @RequirePermission('field-permission:list')
  findFieldPermissions(
    @Query('tableName') tableName?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.accessControlService.findFieldPermissions({ tableName, keyword });
  }

  @Post('field-permissions')
  @RequirePermission('field-permission:create')
  createFieldPermission(@Body() data: any) {
    return this.accessControlService.createFieldPermission(data);
  }

  @Get('roles/:roleId/field-permissions')
  @RequirePermission('field-permission:list')
  getRoleFieldPermissions(@Param('roleId') roleId: string) {
    return this.accessControlService.getRoleFieldPermissions(
      parseInt(roleId, 10),
    );
  }

  @Put('roles/:roleId/field-permissions')
  @RequirePermission('field-permission:update')
  updateRoleFieldPermissions(
    @Param('roleId') roleId: string,
    @Body('fields') fields: Array<{ fieldPermissionId: number; readable: number }>,
  ) {
    return this.accessControlService.updateRoleFieldPermissions(
      parseInt(roleId, 10),
      fields ?? [],
    );
  }

  @Get('roles/:roleId/data-scope')
  @RequirePermission('data-scope:list')
  getRoleDataScope(@Param('roleId') roleId: string) {
    return this.accessControlService.getRoleDataScope(parseInt(roleId, 10));
  }

  @Put('roles/:roleId/data-scope')
  @RequirePermission('data-scope:update')
  updateRoleDataScope(@Param('roleId') roleId: string, @Body() data: any) {
    return this.accessControlService.updateRoleDataScope(
      parseInt(roleId, 10),
      data,
    );
  }
}
