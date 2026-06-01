<script setup lang="ts">
import { RotateCw } from '@vben/icons';

import { Button, Input, Tooltip, Dropdown, Space, Menu, MenuItem } from 'ant-design-vue';

import { computed } from 'vue';

interface BatchAction {
  label: string;
  value: string;
  danger?: boolean;
}

const props = withDefaults(
  defineProps<{
    /** 左侧 / 右侧 */
    position?: 'left' | 'right';
    /** 选中行数（左侧用到） */
    selectedCount?: number;
    /** 批量操作菜单 */
    batchActions?: BatchAction[];
    /** 新增按钮文本 */
    addText?: string;
    /** 是否显示刷新 */
    showRefresh?: boolean;
    /** 是否显示新增 */
    showAdd?: boolean;
    /** 是否显示导出 */
    showExport?: boolean;
    /** 是否显示列设置 */
    showColumnSettings?: boolean;
    /** 是否显示快捷搜索 */
    showQuickSearch?: boolean;
    /** 快捷搜索占位符 */
    searchPlaceholder?: string;
  }>(),
  {
    position: 'left',
    selectedCount: 0,
    batchActions: () => [],
    addText: '新增',
    showRefresh: true,
    showAdd: true,
    showExport: true,
    showColumnSettings: true,
    showQuickSearch: true,
    searchPlaceholder: '搜索…',
  },
);

const emit = defineEmits<{
    add: [];
    refresh: [];
    'batch-action': [value: string];
    export: [];
    'column-settings': [];
    search: [value: string];
  }>();

const hasSelection = computed(() => props.selectedCount > 0);
</script>

<template>
  <!-- 左侧：批量操作 + 新增 + 删除 + 刷新 + 自定义 -->
  <template v-if="position === 'left'">
    <Space>
      <Dropdown
        v-if="batchActions.length > 0 && hasSelection"
        trigger="click"
      >
        <Button>批量操作 ({{ selectedCount }}) <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin-left:2px;vertical-align:-2px"><path d="m6 9 6 6 6-6"/></svg></Button>
        <template #overlay>
          <Menu>
            <MenuItem
              v-for="act in batchActions"
              :key="act.value"
              :danger="act.danger"
              @click="emit('batch-action', act.value)"
            >
              {{ act.label }}
            </MenuItem>
          </Menu>
        </template>
      </Dropdown>
      <Button v-if="showAdd" type="primary" @click="emit('add')">
        {{ addText }}
      </Button>
      <Tooltip v-if="showRefresh" title="刷新">
        <Button @click="emit('refresh')">
          <template #icon><RotateCw class="size-4" /></template>
        </Button>
      </Tooltip>
      <slot />
    </Space>
  </template>

  <!-- 右侧：快捷搜索 + 列设置 + 导出 -->
  <template v-else>
    <Space>
      <Input.Search
        v-if="showQuickSearch"
        :placeholder="searchPlaceholder"
        allow-clear
        @search="(val: string) => emit('search', val)"
      />
      <Tooltip v-if="showColumnSettings" title="列设置">
        <Button @click="emit('column-settings')">
          列设置
        </Button>
      </Tooltip>
      <Tooltip v-if="showExport" title="导出">
        <Button @click="emit('export')">导出</Button>
      </Tooltip>
    </Space>
  </template>
</template>
