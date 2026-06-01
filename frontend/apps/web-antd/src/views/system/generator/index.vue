<script setup lang="ts">
import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { ref, computed, onMounted } from 'vue';

import type { GeneratorApi } from '#/api/core';

import {
  getTablesApi,
  getTableColumnsApi,
  previewCodeApi,
  generateCodeApi,
} from '#/api/core';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

// ── Preview modal ──
const activeTab = ref('backend');
const previewCode = ref<GeneratorApi.GeneratePreview>({
  backend: {},
  frontend: {},
});

const backendFiles = computed(
  () => Object.keys(previewCode.value.backend || {}),
);
const frontendFiles = computed(
  () => Object.keys(previewCode.value.frontend || {}),
);

function getCodeContent(filename: string): string {
  const section =
    previewCode.value[activeTab.value as keyof GeneratorApi.GeneratePreview];
  return section?.[filename] || '';
}

const [PreviewModal, previewModalApi] = useVbenModal({
  title: '代码预览',
  fullscreenButton: true,
  footer: false,
});

// ── Main grid with config form ──
const generating = ref(false);

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      { field: 'columnName', title: '字段名', width: 180 },
      { field: 'dataType', title: '类型', width: 200 },
      {
        field: 'isNullable',
        title: '可空',
        width: 80,
        cellRender: {
          name: 'CellTag',
          props: ({ row }: any) => ({
            color: row.isNullable ? 'orange' : 'green',
            text: row.isNullable ? '是' : '否',
          }),
        },
      },
      { field: 'columnDefault', title: '默认值', width: 140 },
      { field: 'columnComment', title: '注释', minWidth: 160 },
      {
        field: 'isPrimaryKey',
        title: '主键',
        width: 80,
        cellRender: {
          name: 'CellTag',
          props: ({ row }: any) => ({
            color: row.isPrimaryKey ? 'blue' : 'default',
            text: row.isPrimaryKey ? '是' : '否',
          }),
        },
      },
    ],
    data: [],
    pagerConfig: { enabled: false },
    proxyConfig: {
      ajax: {
        query: async () => {
          const formValues = await gridApi.formApi.getValues();
          if (!formValues.tableName) return [];
          try {
            return await getTableColumnsApi(formValues.tableName as string);
          } catch {
            return [];
          }
        },
      },
    },
  },
  formOptions: {
    schema: [
      {
        fieldName: 'tableName',
        label: '选择表',
        component: 'Select',
        componentProps: {
          placeholder: '请选择数据库表',
          showSearch: true,
          filterOption: (input: string, option: any) =>
            option.label?.toLowerCase().includes(input.toLowerCase()),
          onChange: (value: string) => onTableSelect(value),
        },
      },
      {
        fieldName: 'moduleName',
        label: '模块名',
        component: 'Input',
        componentProps: { placeholder: '如: ProductCategory' },
      },
      {
        fieldName: 'modulePath',
        label: '模块路径',
        component: 'Input',
        componentProps: { placeholder: '如: product/category' },
      },
      {
        fieldName: 'apiPrefix',
        label: 'API前缀',
        component: 'Input',
        componentProps: { placeholder: '如: product-categories' },
      },
    ],
    showCollapseButton: false,
    commonConfig: {
      labelWidth: 80,
    },
  },
  tableTitle: '表字段信息',
});

// ── Data loading ──
const tableLoading = ref(false);

async function loadTables() {
  tableLoading.value = true;
  try {
    const tables = await getTablesApi();
    const options = tables.map((t) => ({
      label: t.tableComment
        ? `${t.tableName} (${t.tableComment})`
        : t.tableName,
      value: t.tableName,
    }));
    gridApi.formApi.updateSchema([
      {
        fieldName: 'tableName',
        componentProps: { options },
      },
    ]);
  } finally {
    tableLoading.value = false;
  }
}

async function onTableSelect(tableName: string) {
  if (!tableName) return;
  const parts = tableName
    .replace(/^sys_/, '')
    .split('_')
    .filter(Boolean);
  gridApi.formApi.setValues({
    tableName,
    moduleName: parts
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(''),
    modulePath: parts.join('-'),
    apiPrefix: parts.join('-'),
  });
  gridApi.query();
}

async function handlePreview() {
  const values = await gridApi.formApi.getValues();
  if (
    !values.tableName ||
    !values.moduleName ||
    !values.modulePath ||
    !values.apiPrefix
  ) {
    message.warning('请先选择表并填写配置信息');
    return;
  }
  generating.value = true;
  try {
    previewCode.value = await previewCodeApi(
      values as unknown as GeneratorApi.GenerateParams,
    );
    previewModalApi.open();
  } catch {
    message.error('预览失败，请检查配置');
  } finally {
    generating.value = false;
  }
}

async function handleGenerate() {
  const values = await gridApi.formApi.getValues();
  if (
    !values.tableName ||
    !values.moduleName ||
    !values.modulePath ||
    !values.apiPrefix
  ) {
    message.warning('请先选择表并填写配置信息');
    return;
  }
  generating.value = true;
  try {
    await generateCodeApi(
      values as unknown as GeneratorApi.GenerateParams,
    );
    message.success('代码生成成功');
  } catch {
    message.error('生成失败，请检查配置');
  } finally {
    generating.value = false;
  }
}

onMounted(loadTables);
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="代码生成器">
      <template #toolbar-actions>
        <Button
          type="primary"
          :loading="generating"
          @click="handlePreview"
        >
          预览代码
        </Button>
        <Button
          type="primary"
          danger
          :loading="generating"
          @click="handleGenerate"
        >
          生成代码
        </Button>
      </template>
    </Grid>

    <PreviewModal>
      <a-tabs v-model:activeKey="activeTab">
        <a-tab-pane key="backend" tab="后端代码">
          <a-tabs>
            <a-tab-pane
              v-for="file in backendFiles"
              :key="file"
              :tab="file"
            >
              <pre
                style="
                  max-height: 500px;
                  overflow: auto;
                  background: #1e1e1e;
                  color: #d4d4d4;
                  padding: 16px;
                  border-radius: 6px;
                  font-size: 13px;
                  line-height: 1.5;
                  margin: 0;
                "
              >{{ getCodeContent(file) }}</pre>
            </a-tab-pane>
          </a-tabs>
        </a-tab-pane>
        <a-tab-pane key="frontend" tab="前端代码">
          <a-tabs>
            <a-tab-pane
              v-for="file in frontendFiles"
              :key="file"
              :tab="file"
            >
              <pre
                style="
                  max-height: 500px;
                  overflow: auto;
                  background: #1e1e1e;
                  color: #d4d4d4;
                  padding: 16px;
                  border-radius: 6px;
                  font-size: 13px;
                  line-height: 1.5;
                  margin: 0;
                "
              >{{ getCodeContent(file) }}</pre>
            </a-tab-pane>
          </a-tabs>
        </a-tab-pane>
      </a-tabs>
    </PreviewModal>
  </Page>
</template>
