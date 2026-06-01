<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { computed } from 'vue';

import { useVbenForm } from '#/adapter/form';

import { createMenuApi, updateMenuApi } from '#/api/core';
import type { MenuApi } from '#/api/core';
import { useCrudSchema } from '#/composables/use-crud-schema';
import { menuFields } from './data';

const { formSchema } = useCrudSchema(menuFields);

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
      await updateMenuApi(editId, values as MenuApi.UpdateMenuParams);
      message.success('更新成功');
    } else {
      await createMenuApi(values as MenuApi.CreateMenuParams);
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
          routeName: data.record.routeName,
          type: data.record.type,
          path: data.record.path,
          component: data.record.component,
          redirect: data.record.redirect,
          icon: data.record.icon,
          perms: data.record.perms,
          sortOrder: data.record.sortOrder,
          status: data.record.status,
          keepAlive: data.record.keepAlive,
          show: data.record.show,
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
  title: '菜单管理',
});
</script>

<template>
  <Modal>
    <Form />
  </Modal>
</template>
