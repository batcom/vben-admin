export type {
  ConfigFieldType,
  ConfigItem,
  ConfigGroup,
  FieldComponentMeta,
} from './types';

export {
  registerFieldType,
  getFieldComponent,
  getRegisteredTypes,
} from './registry';

// Components – re-exported after they're created
export { default as ConfigField } from './components/ConfigField.vue';
export { default as ConfigTabGroup } from './components/ConfigTabGroup.vue';
export { default as ConfigPage } from './components/ConfigPage.vue';

// Composables
export { useConfigData } from './composables/use-config-data';
export { useConfigForm } from './composables/use-config-form';
export type { ConfigApi } from './composables/use-config-data';

// Antd adapters
export { registerAntdAdapters } from './adapters/antd/index';
