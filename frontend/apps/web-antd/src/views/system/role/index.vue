<script setup lang="ts">
import { Page, useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { ref } from 'vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { deleteRoleApi, getRoleListApi } from '#/api/core';
import { useCrudSchema } from '#/composables/use-crud-schema';
import { roleFields } from './data';
import RoleModal from './modal.vue';
import ListToolbar from '#/components/common/list-toolbar.vue';

const { searchSchema, tableColumns } = useCrudSchema(roleFields);

const selectedIds = ref<number[]>([]);

const [RoleFormModal, modalApi] = useVbenModal({
  connectedComponent: RoleModal,
});

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      { type: 'checkbox', width: 50, fixed: 'left' },
      ...tableColumns.value,
      {
        field: 'action',
        title: '操作',
        width: 160,
        fixed: 'right',
        cellRender: {
          name: 'CellOperation',
          attrs: {
            onClick: ({ code, row }: any) => {
              if (code === 'edit') handleEdit(row);
              if (code === 'delete') handleDelete(row);
            },
          },
        },
      },
    ],
    proxyConfig: {
      ajax: {
        query: async ({ page }: any) => {
          const formValues = gridApi.formApi.getValues();
          const res = await getRoleListApi({
            page: page.currentPage,
            pageSize: page.pageSize,
            ...formValues,
          });
          return { items: res.items, total: res.total };
        },
      },
    },
    pagerConfig: { pageSize: 10 },
    checkboxConfig: { checkField: 'checked', reserve: true, highlight: true },
  },
  formOptions: {
    schema: [
      { fieldName: 'keyword', label: '关键词', component: 'Input', componentProps: { placeholder: '名称/编码' } },
      ...searchSchema.value.filter(Boolean) as any,
    ],
  },
});

function handleCreate() {
  modalApi.open();
}

async function handleEdit(record: any) {
  modalApi.open();
  modalApi.setData({ record, isEdit: true });
}

async function handleDelete(record: any) {
  await deleteRoleApi(record.id);
  message.success('删除成功');
  gridApi.query();
}

function onSelectChange({ records }: any) {
  selectedIds.value = records.map((r: any) => r.id);
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) return;
  await Promise.all(selectedIds.value.map((id) => deleteRoleApi(id)));
  message.success(`批量删除成功 (${selectedIds.value.length} 条)`);
  selectedIds.value = [];
  gridApi.query();
}

function onQuickSearch(value: string) {
  gridApi.formApi.setValues({ keyword: value || '' });
  gridApi.reload();
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="角色管理" @checkbox-change="onSelectChange" @checkbox-all="onSelectChange">
      <template #toolbar-actions>
        <ListToolbar
          position="left"
          :selected-count="selectedIds.length"
          :batch-actions="[{ label: '批量删除', value: 'delete', danger: true }]"
          add-text="新增角色"
          @add="handleCreate"
          @refresh="gridApi.reload()"
          @batch-action="(action: string) => { if (action === 'delete') handleBatchDelete(); }"
        />
      </template>
      <template #toolbar-tools>
        <ListToolbar position="right" search-placeholder="搜索名称/编码…" @search="onQuickSearch" />
      </template>
    </Grid>
    <RoleFormModal @success="gridApi.query()" />
  </Page>
</template>
