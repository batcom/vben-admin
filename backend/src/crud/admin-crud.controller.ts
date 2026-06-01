import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CrudRegistry } from './crud.registry';
import { CrudMetaService } from './crud.meta';
import { runPipeline } from './crud.pipeline';
import type { ProcessorContext } from './crud.types';

// Concrete CRUD controller for the 'admin' app.
// Routes: /admin/:entity, /admin/:entity/:id, /admin/:entity/meta
// With global prefix 'api': /api/admin/user, /api/admin/user/1, /api/admin/user/meta

@Controller('admin')
export class AdminCrudController {
  constructor(
    private registry: CrudRegistry,
    private meta: CrudMetaService,
    private prisma: PrismaService,
  ) {}

  @Get(':entity/meta')
  async getMeta(@Param('entity') entity: string, @Req() req: any) {
    const lang = req.headers['accept-language'] || 'zh-CN';
    return this.meta.getEntityMeta('admin', entity, this.getConfig(entity), lang);
  }

  @Get(':entity')
  async list(@Param('entity') entity: string, @Query() query: any, @Req() req: any) {
    return this.run(entity, 'list', { query }, req);
  }

  @Get(':entity/:id')
  async detail(@Param('entity') entity: string, @Param('id') id: string, @Req() req: any) {
    return this.run(entity, 'detail', { params: { id } }, req);
  }

  @Post(':entity')
  async create(@Param('entity') entity: string, @Body() body: any, @Req() req: any) {
    return this.run(entity, 'create', { body }, req);
  }

  @Put(':entity/:id')
  async update(
    @Param('entity') entity: string,
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    return this.run(entity, 'update', { params: { id }, body }, req);
  }

  @Delete(':entity/:id')
  async delete(
    @Param('entity') entity: string,
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.run(entity, 'delete', { params: { id } }, req);
  }

  @Get(':entity/options/:field')
  async getFieldOptions(
    @Param('entity') entity: string,
    @Param('field') field: string,
  ) {
    return this.meta.getFieldOptions(entity, field, this.prisma);
  }

  private getConfig(entity: string) {
    return this.registry.getEntity('admin', entity)?.config;
  }

  private async run(
    entity: string,
    route: string,
    extra: Partial<ProcessorContext>,
    req: any,
  ) {
    const ent = this.registry.getEntity('admin', entity);
    if (!ent) throw new NotFoundException(`Entity "${entity}" not found`);
    const ctx: ProcessorContext = {
      app: 'admin',
      entity: ent.model,
      route,
      params: extra.params || {},
      query: extra.query || {},
      body: extra.body || {},
      user: req.user,
      prisma: this.prisma,
      _deletedField: ent.config._deletedField,
      _searchableFields: ent.config._searchableFields,
    };
    await runPipeline(ent.getProcessors(route), {}, ctx);
    return ctx.result;
  }
}
