<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { computed } from 'vue';

import { useVbenForm } from '#/adapter/form';

import { createUserApi, updateUserApi } from '#/api/core';
import type { UserApi } from '#/api/core';
import { useCrudSchema } from '#/composables/use-crud-schema';
import { userFields } from './data';

const { formSchema } = useCrudSchema(userFields);

let isEdit = false;
let editId: number | null = null;

const baseSchema = computed(() => formSchema.value);

const editSchema = computed(() =>
  baseSchema.value.map((item) => {
    if (item.fieldName === 'username') {
      return { ...item, componentProps: { ...item.componentProps, disabled: true } };
    }
    if (item.fieldName === 'password') {
      return { ...item, rules: undefined as any, help: '留空则不修改' };
    }
    return item;
  }),
);

const createSchema = computed(() =>
  baseSchema.value.map((item) => {
    if (item.fieldName === 'password') {
      return { ...item, rules: 'required' };
    }
    return item;
  }),
);

const [Form, formApi] = useVbenForm({
  schema: createSchema.value as any,
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: async () => {
    const values = (await formApi.getValues()) as Record<string, any>;
    if (isEdit && editId) {
      const { password, ...updateData } = values;
      await updateUserApi(
        editId,
        (password ? values : updateData) as UserApi.UpdateUserParams,
      );
      message.success('更新成功');
    } else {
      await createUserApi(values as UserApi.CreateUserParams);
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
          username: data.record.username,
          realName: data.record.realName,
          email: data.record.email,
          phone: data.record.phone,
          status: data.record.status,
        });
        formApi.setState({ schema: editSchema.value as any });
      } else {
        isEdit = false;
        editId = null;
        formApi.resetForm();
        formApi.setState({ schema: createSchema.value as any });
      }
    }
  },
  title: '用户管理',
});
</script>

<template>
  <Modal>
    <Form />
  </Modal>
</template>
