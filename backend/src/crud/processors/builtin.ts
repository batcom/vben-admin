import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import type { CrudProcessor, ProcessorContext } from '../crud.types';
import { registerBuiltin } from '../crud.pipeline';

// ── Auth ──

registerBuiltin('auth', {
  execute(ctx) {
    if (!ctx.user) throw new UnauthorizedException();
    const perm = ctx._processorConfig?.permission;
    if (perm) {
      const codes: string[] = ctx.user.permissions || [];
      if (!codes.includes(perm)) throw new ForbiddenException();
    }
  },
});

// ── Validate ──

registerBuiltin('validate', {
  execute() {
    // handled by NestJS ValidationPipe at controller level
  },
});

// ── Paginate ──

registerBuiltin('paginate', {
  execute(ctx) {
    const page = Math.max(parseInt(ctx.query.page) || 1, 1);
    const pageSize = Math.min(Math.max(parseInt(ctx.query.pageSize) || 10, 1), 200);
    ctx._query = { ...(ctx._query || {}), skip: (page - 1) * pageSize, take: pageSize };
  },
});

// ── Search ──

registerBuiltin('search', {
  execute(ctx) {
    const fields: string[] = ctx._processorConfig?.fields || ctx._searchableFields || [];
    const keyword = ctx.query.keyword;
    if (!keyword || fields.length === 0) return;
    ctx._query = {
      ...(ctx._query || {}),
      where: {
        ...((ctx._query || {}).where || {}),
        OR: fields.map((f) => ({ [f]: { contains: keyword, mode: 'insensitive' } })),
      },
    };
  },
});

// ── Filter (apply search form fields as WHERE conditions) ──

registerBuiltin('filter', {
  execute(ctx) {
    const skip = ['page', 'pageSize', 'keyword', 'sortField', 'sortOrder'];
    const where: any = { ...((ctx._query || {}).where || {}) };
    for (const [key, val] of Object.entries(ctx.query)) {
      if (skip.includes(key)) continue;
      if (val === undefined || val === null || val === '') continue;
      // Date range: { field: ['start', 'end'] }
      if (Array.isArray(val) && val.length === 2) {
        where[key] = { gte: new Date(val[0]), lte: new Date(val[1]) };
      } else if (typeof val === 'string') {
        // Text fields use contains (insensitive) for search-like behavior
        where[key] = { contains: val, mode: 'insensitive' };
      } else {
        where[key] = val;
      }
    }
    ctx._query = { ...(ctx._query || {}), where };
  },
});

// ── List ──

registerBuiltin('list', {
  async execute(ctx) {
    const model = ctx.prisma[ctx.entity];
    const { skip, take, where, orderBy } = ctx._query || {};
    // Only filter soft-deleted rows if the model has a deletedAt field
    const hasDeleted = ctx._deletedField;
    const finalWhere = hasDeleted ? { ...where, deletedAt: null } : where;
    const [items, total] = await Promise.all([
      model.findMany({
        where: finalWhere,
        skip, take,
        orderBy: orderBy || { createdAt: 'desc' },
      }),
      model.count({ where: finalWhere }),
    ]);
    ctx.result = { items, total };
  },
});

// ── Exists ──

registerBuiltin('exists', {
  async execute(ctx) {
    const id = parseInt(ctx.params.id, 10);
    const where: any = { id };
    if (ctx._deletedField) where.deletedAt = null;
    const record = await ctx.prisma[ctx.entity].findFirst({
      where,
      select: { id: true },
    });
    if (!record) throw new NotFoundException(`${ctx.entity} not found`);
    ctx._record = record;
  },
});

// ── Detail ──

registerBuiltin('detail', {
  async execute(ctx) {
    const id = parseInt(ctx.params.id, 10);
    const where: any = { id };
    if (ctx._deletedField) where.deletedAt = null;
    const record = await ctx.prisma[ctx.entity].findFirst({ where });
    if (!record) throw new NotFoundException(`${ctx.entity} not found`);
    ctx.result = record;
  },
});

// ── Create ──

registerBuiltin('create', {
  async execute(ctx) {
    ctx.result = await ctx.prisma[ctx.entity].create({ data: ctx.body });
  },
});

// ── Update ──

registerBuiltin('update', {
  async execute(ctx) {
    const id = parseInt(ctx.params.id, 10);
    ctx.result = await ctx.prisma[ctx.entity].update({ where: { id }, data: ctx.body });
  },
});

// ── Soft Delete ──

registerBuiltin('softDelete', {
  async execute(ctx) {
    const id = parseInt(ctx.params.id, 10);
    ctx.result = await ctx.prisma[ctx.entity].update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
});

// ── Hard Delete ──

registerBuiltin('hardDelete', {
  async execute(ctx) {
    const id = parseInt(ctx.params.id, 10);
    ctx.result = await ctx.prisma[ctx.entity].delete({ where: { id } });
  },
});

// ── Unique check ──

registerBuiltin('unique', {
  async execute(ctx) {
    const fields: string[] = ctx._processorConfig?.fields || [];
    for (const field of fields) {
      const val = ctx.body[field];
      if (val !== undefined && val !== null) {
        const existing = await ctx.prisma[ctx.entity].findFirst({
          where: { [field]: val },
        });
        if (existing) {
          throw new BadRequestException(`${field} "${val}" already exists`);
        }
      }
    }
  },
});

// ── Hash password ──

registerBuiltin('hash', {
  async execute(ctx) {
    const field = ctx._processorConfig?.field || 'password';
    if (ctx.body[field]) {
      ctx.body[field] = await bcrypt.hash(ctx.body[field], 10);
    }
  },
});

// ── Audit log ──

registerBuiltin('log', {
  execute(ctx) {
    // TODO: integrate with audit log table
    console.log(`[CRUD] ${ctx.app}:${ctx.entity} ${ctx.route} user=${ctx.user?.userId || '?'}`);
  },
});

// ── Tree transform ──

registerBuiltin('tree', {
  execute(ctx) {
    const config = ctx._processorConfig || {};
    const items: any[] = ctx.result?.items || ctx.result || [];
    if (!Array.isArray(items)) return;
    const pf = config.parentField || 'parentId';
    const rf = config.rowField || 'id';
    const map = new Map<any, any>();
    items.forEach((item: any) => map.set(item[rf], { ...item, children: [] }));
    ctx.result = [];
    items.forEach((item: any) => {
      const node = map.get(item[rf]);
      const parent = map.get(item[pf]);
      if (parent) parent.children.push(node);
      else (ctx.result as any[]).push(node);
    });
  },
});
