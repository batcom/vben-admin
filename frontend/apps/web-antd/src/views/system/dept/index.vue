<script setup lang="ts">
import { Page, useVbenModal } from '@vben/common-ui';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';

import { deleteDeptApi, getDeptListApi } from '#/api/core';
import { useCrudSchema } from '#/composables/use-crud-schema';
import { deptFields } from './data';
import DeptModal from './modal.vue';
import ListToolbar from '#/components/common/list-toolbar.vue';

const { searchSchema, tableColumns } = useCrudSchema(deptFields);

const [DeptFormModal, modalApi] = useVbenModal({
  connectedComponent: DeptModal,
});

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions: {
    columns: [
      ...tableColumns.value,
      {
        field: 'action',
        title: '操作',
        width: 200,
        fixed: 'right',
        cellRender: {
          name: 'CellOperation',
          attrs: {
            onClick: ({ code, row }: any) => {
              if (code === 'append') handleCreate(row.id);
              if (code === 'edit') handleEdit(row);
              if (code === 'delete') handleDelete(row);
            },
          },
          options: [
            { code: 'append', text: '新增子部门' },
            'edit',
            'delete',
          ],
        },
      },
    ],
    proxyConfig: {
      ajax: {
        query: async () => {
          const formValues = gridApi.formApi.getValues();
          return await getDeptListApi(formValues);
        },
      },
    },
    treeConfig: { parentField: 'parentId', rowField: 'id', transform: true },
  },
  formOptions: {
    schema: [
      { fieldName: 'keyword', label: '关键词', component: 'Input', componentProps: { placeholder: '部门名称' } },
      ...searchSchema.value.filter(Boolean) as any,
    ],
  },
});

function handleCreate(parentId?: number) {
  modalApi.open();
  if (parentId !== undefined) {
    modalApi.setData({ parentId });
  }
}

async function handleEdit(record: any) {
  modalApi.open();
  modalApi.setData({ record, isEdit: true });
}

async function handleDelete(record: any) {
  await deleteDeptApi(record.id);
  message.success('删除成功');
  gridApi.query();
}
</script>

<template>
  <Page auto-content-height>
    <Grid table-title="部门管理">
      <template #toolbar-actions>
        <ListToolbar
          position="left"
          :show-add="false"
          :show-refresh="true"
          :batch-actions="[]"
          @refresh="gridApi.reload()"
        >
          <Button type="primary" @click="handleCreate()">新增部门</Button>
        </ListToolbar>
      </template>
    </Grid>
    <DeptFormModal @success="gridApi.query()" />
  </Page>
</template>
