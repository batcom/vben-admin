import { Type } from '@nestjs/common';

// ── Processor System ──

export interface ProcessorContext {
  app: string;
  entity: string;
  route: string;
  params: Record<string, any>;
  query: Record<string, any>;
  body: Record<string, any>;
  user?: any;
  prisma: any;
  result?: any;
  [key: string]: any;
}

export interface CrudProcessor {
  execute(ctx: ProcessorContext): Promise<void> | void;
}

export interface ProcessorRef {
  use: string | Type<CrudProcessor>;
  config?: Record<string, any>;
}

export type RouteProcessors = ProcessorRef[];

// ── Entity Config ──

export interface EntityConfig {
  /** Prisma model name (lowercase) */
  model: string;
  /** Display label */
  label?: string;
  /** Which routes to enable */
  routes?: string[];
  /** Route-level processor overrides */
  processors?: Partial<Record<string, RouteProcessors>>;
  /** Add extra processors to default chain (append) */
  extraProcessors?: Partial<Record<string, RouteProcessors>>;
  /** Field overrides sent to frontend */
  overrides?: Record<string, FieldOverride>;
  /** For tree-structured tables (menu, dept) */
  tree?: { parentField: string; rowField: string };
  /** Search config */
  search?: string[];
  /** Available actions for the frontend toolbar */
  actions?: Record<string, any>;
  /** Internal: does this model have a deletedAt field */
  _deletedField?: boolean;
  /** Internal: string fields for keyword search */
  _searchableFields?: string[];
}

export interface FieldOverride {
  component?: string;
  componentProps?: Record<string, any>;
  hideInSearch?: boolean;
  hideInTable?: boolean;
  hideInForm?: boolean;
  options?: Record<string, string> | Array<{ label: string; value: any }>;
}

// ── App Config ──

export interface CrudAppConfig {
  name: string;
  prefix: string;
  guard?: any;
  entities?: Record<string, EntityConfig>;
  autoScan?: boolean; // scan all Prisma models
}

// ── Module Config ──

export interface CrudModuleConfig {
  apps: CrudAppConfig[];
  processors?: Record<string, Type<CrudProcessor>>;
}

// ── Meta API ──

export interface CrudFieldMeta {
  fieldName: string;
  label: string;
  dataType: string;
  nullable: boolean;
  isPk: boolean;
}

export interface CrudEntityMeta {
  entity: string;
  label: string;
  fields: CrudFieldMeta[];
  overrides: Record<string, FieldOverride>;
  actions: Record<string, any>;
  routes: string[];
  tree?: { parentField: string; rowField: string };
}
