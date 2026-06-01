<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { computed } from 'vue';

import { useVbenForm } from '#/adapter/form';

import { createRoleApi, updateRoleApi } from '#/api/core';
import type { RoleApi } from '#/api/core';
import { useCrudSchema } from '#/composables/use-crud-schema';
import { roleFields } from './data';

const { formSchema } = useCrudSchema(roleFields);

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
      await updateRoleApi(editId, values as RoleApi.UpdateRoleParams);
      message.success('更新成功');
    } else {
      await createRoleApi(values as RoleApi.CreateRoleParams);
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
          name: data.record.name,
          code: data.record.code,
          description: data.record.description,
          status: data.record.status,
          sortOrder: data.record.sortOrder,
        });
      } else {
        isEdit = false;
        editId = null;
        formApi.resetForm();
      }
    }
  },
  title: '角色管理',
});
</script>

<template>
  <Modal>
    <Form />
  </Modal>
</template>
