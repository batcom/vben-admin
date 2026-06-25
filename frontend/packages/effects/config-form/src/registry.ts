import type { FieldComponentMeta } from './types';

const registry = new Map<string, FieldComponentMeta>();

export function registerFieldType(
  type: string,
  meta: FieldComponentMeta,
): void {
  registry.set(type, meta);
}

export function getFieldComponent(
  type: string,
): FieldComponentMeta | undefined {
  return registry.get(type);
}

export function getRegisteredTypes(): string[] {
  return Array.from(registry.keys());
}
