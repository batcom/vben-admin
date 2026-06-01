import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { CrudEntityMeta, CrudFieldMeta, EntityConfig } from './crud.types';

const DMMF_MODELS: any[] | null = (Prisma as any).dmmf?.datamodel?.models ?? null;

const TYPE_MAP: Record<string, string> = {
  String: 'varchar',
  Int: 'int4',
  BigInt: 'int8',
  Float: 'float8',
  Decimal: 'decimal',
  Boolean: 'bool',
  DateTime: 'timestamp',
  Json: 'jsonb',
};

const ZH_LABELS: Record<string, string> = {
  id: 'ID', username: '用户名', password: '密码', realName: '真实姓名',
  email: '邮箱', phone: '手机', avatar: '头像', status: '状态',
  deptId: '部门', createdAt: '创建时间', updatedAt: '更新时间', deletedAt: '删除时间',
  name: '名称', code: '编码', description: '描述', sortOrder: '排序',
  parentId: '上级', routeName: '路由名', type: '类型', path: '路径',
  component: '组件', redirect: '重定向', icon: '图标', perms: '权限标识',
  keepAlive: '缓存', show: '显示',
  orderNo: '订单号', userId: '用户', totalAmount: '金额', remark: '备注',
  tableName: '表名', fieldName: '字段名',
  roleId: '角色', menuId: '菜单', permissionId: '权限',
  method: '方法', scopeType: '范围类型',
  readable: '可读',
  title: '标题', content: '内容', summary: '摘要', coverUrl: '封面', tags: '标签',
  publishedAt: '发布时间',
};

const EN_LABELS: Record<string, string> = {
  id: 'ID', username: 'Username', password: 'Password', realName: 'Name',
  email: 'Email', phone: 'Phone', avatar: 'Avatar', status: 'Status',
  deptId: 'Dept', createdAt: 'Created At', updatedAt: 'Updated At', deletedAt: 'Deleted At',
  name: 'Name', code: 'Code', description: 'Description', sortOrder: 'Sort Order',
  parentId: 'Parent', routeName: 'Route Name', type: 'Type', path: 'Path',
  component: 'Component', redirect: 'Redirect', icon: 'Icon', perms: 'Permission',
  keepAlive: 'Keep Alive', show: 'Show',
  orderNo: 'Order No', userId: 'User', totalAmount: 'Amount', remark: 'Remark',
  tableName: 'Table', fieldName: 'Field',
  roleId: 'Role', menuId: 'Menu', permissionId: 'Permission',
  method: 'Method', scopeType: 'Scope Type',
  readable: 'Readable',
  title: 'Title', content: 'Content', summary: 'Summary', coverUrl: 'Cover', tags: 'Tags',
  publishedAt: 'Published At',
};

function getLabels(lang: string): Record<string, string> {
  if (lang && lang.startsWith('en')) return EN_LABELS;
  return ZH_LABELS;
}

@Injectable()
export class CrudMetaService {
  getEntityFieldMeta(model: string, lang = 'zh-CN'): CrudFieldMeta[] {
    if (!DMMF_MODELS) return [];
    const m = DMMF_MODELS.find((m: any) => m.name.toLowerCase() === model.toLowerCase());
    if (!m) return [];
    const labels = getLabels(lang);
    return m.fields
      .filter((f: any) => f.kind === 'scalar')
      .map((f: any) => ({
        fieldName: f.name,
        label: labels[f.name] || f.name,
        dataType: TYPE_MAP[f.type] || f.type.toLowerCase(),
        nullable: !f.isRequired,
        isPk: f.isId || false,
      }));
  }

  getEntityMeta(app: string, entity: string, config?: EntityConfig, lang = 'zh-CN'): CrudEntityMeta {
    const fields = this.getEntityFieldMeta(entity, lang);
    const overrides = config?.overrides || {};
    const actions = config?.actions || {};
    const routes = config?.routes || ['list', 'detail', 'create', 'update', 'delete'];
    return {
      entity,
      label: config?.label || '',
      fields,
      overrides,
      actions,
      routes,
      tree: config?.tree,
    };
  }

  async getFieldOptions(entity: string, field: string, prisma: any) {
    const model = (Prisma as any).dmmf?.datamodel?.models?.find(
      (m: any) => m.name.toLowerCase() === entity.toLowerCase(),
    );
    if (!model) return [];
    const tableName = model.dbName || model.name;

    // For status field, return common options based on entity
    if (field === 'status') {
      // Check if there are any existing values that look like status enum
      try {
        const values: any[] = await prisma.$queryRawUnsafe(
          `SELECT DISTINCT status FROM "${tableName}" WHERE status IS NOT NULL ORDER BY status`,
        );
        if (values.length > 0) {
          return values.map((v: any) => ({ value: v.status, label: v.status }));
        }
      } catch {}
      return [
        { value: 'draft', label: '草稿' },
        { value: 'published', label: '已发布' },
        { value: 'archived', label: '已归档' },
        { value: 'pending', label: '待处理' },
        { value: 'completed', label: '已完成' },
        { value: 'cancelled', label: '已取消' },
      ];
    }

    // For tags/select fields, query distinct values from DB
    const fieldDef = model.fields.find((f: any) => f.name === field && f.kind === 'scalar');
    if (!fieldDef) return [];
    const dbFieldName = fieldDef.dbName || field;
    try {
      const values: any[] = await prisma.$queryRawUnsafe(
        `SELECT DISTINCT "${dbFieldName}" FROM "${tableName}" WHERE "${dbFieldName}" IS NOT NULL AND "${dbFieldName}" != '' ORDER BY "${dbFieldName}"`,
      );
      return values.map((v: any) => ({ value: v[dbFieldName], label: String(v[dbFieldName]) }));
    } catch {
      return [];
    }
  }
}
