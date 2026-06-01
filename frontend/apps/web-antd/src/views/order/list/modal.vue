<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { computed } from 'vue';

import { useVbenForm } from '#/adapter/form';

import { createOrderApi, updateOrderApi } from '#/api/core';
import type { OrderApi } from '#/api/core';
import { useCrudSchema } from '#/composables/use-crud-schema';
import { orderFields } from './data';

const { formSchema } = useCrudSchema(orderFields);

let isEdit = false;
let editId: number | null = null;

const baseSchema = computed(() => formSchema.value as any);

const editSchema = computed(() =>
  baseSchema.value.map((item: Record<string, any>) => {
    if (item.fieldName === 'orderNo') {
      return { ...item, componentProps: { ...item.componentProps, disabled: true } };
    }
    return item;
  }),
);

const [Form, formApi] = useVbenForm({
  schema: baseSchema.value,
  showDefaultActions: false,
});

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: async () => {
    const values = (await formApi.getValues()) as Record<string, any>;
    if (isEdit && editId) {
      await updateOrderApi(editId, values as OrderApi.UpdateOrderParams);
      message.success('更新成功');
    } else {
      await createOrderApi(values as OrderApi.CreateOrderParams);
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
          orderNo: data.record.orderNo,
          totalAmount: data.record.totalAmount,
          status: data.record.status,
          remark: data.record.remark,
        });
        formApi.setState({ schema: editSchema.value });
      } else {
        isEdit = false;
        editId = null;
        formApi.resetForm();
        formApi.setState({ schema: baseSchema.value });
      }
    }
  },
  title: '订单管理',
});
</script>

<template>
  <Modal>
    <Form />
  </Modal>
</template>
