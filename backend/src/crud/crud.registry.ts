import type { CrudAppConfig, EntityConfig, CrudProcessor, ProcessorRef, RouteProcessors } from './crud.types';
import { getBuiltinProcessor } from './crud.pipeline';

const DEFAULT_ROUTES = ['list', 'detail', 'create', 'update', 'delete'];

const DEFAULT_PROCESSORS: Record<string, RouteProcessors> = {
  list: [
    { use: 'auth' }, { use: 'filter' }, { use: 'search' }, { use: 'paginate' }, { use: 'list' },
  ],
  detail: [
    { use: 'auth' }, { use: 'detail' },
  ],
  create: [
    { use: 'auth' }, { use: 'validate' }, { use: 'create' },
  ],
  update: [
    { use: 'auth' }, { use: 'validate' }, { use: 'exists' }, { use: 'update' },
  ],
  delete: [
    { use: 'auth' }, { use: 'exists' }, { use: 'softDelete' },
  ],
};

export interface ResolvedEntity {
  model: string;
  label: string;
  routes: string[];
  getProcessors(route: string): ProcessorRef[];
  config: EntityConfig;
}

export class CrudRegistry {
  private apps = new Map<string, CrudAppConfig>();
  private entities = new Map<string, Map<string, ResolvedEntity>>();

  registerApp(config: CrudAppConfig) {
    this.apps.set(config.name, config);
    const entityMap = new Map<string, ResolvedEntity>();
    const prismaModels = this.getAllPrismaModels();
    const modelSet = new Set(prismaModels.map((m: any) => m.name.toLowerCase()));

    for (const [name, ec] of Object.entries(config.entities || {})) {
      const model = ec.model;
      entityMap.set(name, {
        model,
        label: ec.label || name,
        routes: ec.routes || DEFAULT_ROUTES,
        getProcessors(route: string) {
          const custom = ec.processors?.[route];
          if (custom) return custom;
          const defaults = DEFAULT_PROCESSORS[route];
          const extra = ec.extraProcessors?.[route] || [];
          return [...(defaults || []), ...extra];
        },
        config: ec,
      });
    }

    // Auto-scan remaining Prisma models
    if (config.autoScan !== false) {
      for (const model of prismaModels) {
        const name = model.name.toLowerCase();
        if (entityMap.has(name)) continue;
        if (['userrole', 'rolemenu', 'rolepermission', 'userpermission', 'rolefieldpermission', 'roleapipermission', 'datascope', 'apipermission', 'fieldpermission'].includes(name)) continue;
        const hasDeleted = model.fields.some((f: any) => f.name === 'deletedAt');
        const searchFields = model.fields
          .filter((f: any) => f.kind === 'scalar' && f.type === 'String' && !['id', 'password', 'avatar'].includes(f.name))
          .map((f: any) => f.name);
        entityMap.set(name, {
          model: name,
          label: name.charAt(0).toUpperCase() + name.slice(1),
          routes: DEFAULT_ROUTES,
          getProcessors(route: string) {
            const defaults = DEFAULT_PROCESSORS[route];
            if (route === 'delete' && !hasDeleted) {
              // Entities without deletedAt use hard delete
              return [{ use: 'auth' }, { use: 'exists' }, { use: 'hardDelete' }];
            }
            return [...(defaults || [])];
          },
          config: {
            model: name,
            _deletedField: hasDeleted,
            _searchableFields: searchFields,
          },
        });
      }
    }

    this.entities.set(config.name, entityMap);
  }

  getApp(app: string): CrudAppConfig | undefined {
    return this.apps.get(app);
  }

  getEntity(app: string, entity: string): ResolvedEntity | undefined {
    return this.entities.get(app)?.get(entity);
  }

  listEntities(app: string): string[] {
    return [...(this.entities.get(app)?.keys() || [])];
  }

  private getAllPrismaModels(): any[] {
    try {
      const { Prisma } = require('@prisma/client');
      return Prisma.dmmf?.datamodel?.models || [];
    } catch {
      return [];
    }
  }
}
