import type { Component } from 'vue';

export type ConfigFieldType =
  | 'string' | 'number' | 'boolean' | 'textarea'
  | 'select' | 'radio' | 'image' | 'file' | 'color'
  | 'json' | 'array' | 'dict' | 'kv2d' | 'html';

export interface ConfigItem {
  id: number;
  group: string;
  key: string;
  label: string;
  value: any;
  defaultValue: any;
  type: ConfigFieldType;
  sortOrder: number;
  placeholder?: string;
  remark?: string;
  options?: string;
  // runtime-only: not persisted
  _saving?: boolean;
  _error?: string;
}

export interface ConfigGroup {
  key: string;
  label: string;
  sort: number;
  items: ConfigItem[];
}

export interface FieldComponentMeta {
  component: Component;
  props?: Record<string, any>;
  fullWidth?: boolean;
  showLabel?: boolean;
  saveOn?: 'change' | 'blur' | 'manual';
}
