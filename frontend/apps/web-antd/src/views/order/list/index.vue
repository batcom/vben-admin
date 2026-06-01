<script setup lang="ts">
import { Page, useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { ref } from 'vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { deleteOrderApi, getOrderListApi } from '#/api/core';
import { useCrudSchema } from '#/composables/use-crud-schema';
import { orderFields } from './data';
import OrderModal from './modal.vue';
import ListToolbar from '#/components/common/list-toolbar.vue';

const { searchSchema, tableColumns } = useCrudSchema(orderFields);

const selectedIds = ref<number[]>([]);

const [OrderFormModal, modalApi] = useVbenModal({
  connectedComponent: OrderModal,
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
          const res = await getOrderListApi({
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
      { fieldName: 'keyword', label: '关键词', component: 'Input', componentProps: { placeholder: '订单号/备注' } },
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
  await deleteOrderApi(record.id);
  message.success('删除成功');
  gridApi.query();
}

function onSelectChange({ records }: any) {
  selectedIds.value = records.map((r: any) => r.id);
}

async function handleBatchDelete() {
  if (selectedIds.value.length === 0) return;
  await Promise.all(selectedIds.value.map((id) => deleteOrderApi(id)));
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
    <Grid table-title="订单列表" @checkbox-change="onSelectChange" @checkbox-all="onSelectChange">
      <template #toolbar-actions>
        <ListToolbar
          position="left"
          :selected-count="selectedIds.length"
          :batch-actions="[{ label: '批量删除', value: 'delete', danger: true }]"
          add-text="新增订单"
          @add="handleCreate"
          @refresh="gridApi.reload()"
          @batch-action="(action: string) => { if (action === 'delete') handleBatchDelete(); }"
        />
      </template>
      <template #toolbar-tools>
        <ListToolbar position="right" search-placeholder="搜索订单号…" @search="onQuickSearch" />
      </template>
    </Grid>
    <OrderFormModal @success="gridApi.query()" />
  </Page>
</template>
