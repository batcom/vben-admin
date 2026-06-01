<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { computed } from 'vue';

import { useVbenForm } from '#/adapter/form';

import { createDeptApi, updateDeptApi } from '#/api/core';
import type { DeptApi } from '#/api/core';
import { useCrudSchema } from '#/composables/use-crud-schema';
import { deptFields } from './data';

const { formSchema } = useCrudSchema(deptFields);

let isEdit = false;
let editId: number | null = null;

const schema = computed(() => formSchema.value as any);

const [Form, formApi] = useVbenForm({
  schema: schema.value,
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: async () => {
    const values = (await formApi.getValues()) as Record<string, any>;
    if (isEdit && editId) {
      await updateDeptApi(editId, values as DeptApi.UpdateDeptParams);
      message.success('更新成功');
    } else {
      await createDeptApi(values as DeptApi.CreateDeptParams);
      message.success('创建成功');
    }
    modalApi.close();
  },
  onOpenChange(isOpen) {
    if (isOpen) {
      const data = modalApi.getData<Record<string, any>>();
      if (data?.isEdit && data?.record) {
        isEdit = true;
        editId = data.record.id;
        formApi.setValues({
          parentId: data.record.parentId,
          name: data.record.name,
          sortOrder: data.record.sortOrder,
          status: data.record.status,
        });
      } else {
        isEdit = false;
        editId = null;
        formApi.resetForm();
        if (data?.parentId !== undefined) {
          formApi.setValues({ parentId: data.parentId });
        }
      }
    }
  },
  title: '部门管理',
});
</script>

<template>
  <Modal>
    <Form />
  </Modal>
</template>
