import type { CrudField } from '#/composables/use-crud-schema';

export const orderFields: CrudField[] = [
  { fieldName: 'id', label: 'ID', dataType: 'int4', hideInSearch: true, hideInForm: true },
  { fieldName: 'orderNo', label: '订单号', dataType: 'varchar', tableProps: { minWidth: 160 } },
  { fieldName: 'totalAmount', label: '金额', dataType: 'numeric', tableProps: { width: 100 } },
  {
    fieldName: 'status', label: '状态', dataType: 'varchar',
    searchProps: {
      component: 'Select',
      componentProps: { allowClear: true, placeholder: '请选择', options: [{ label: '待处理', value: 'pending' }, { label: '处理中', value: 'processing' }, { label: '已完成', value: 'completed' }, { label: '已取消', value: 'cancelled' }] },
    },
    tableProps: {
      width: 90,
      cellRender: {
        name: 'CellTag',
        props: ({ row }: any) => {
          const map: Record<string, { color: string; text: string }> = {
            pending: { color: 'orange', text: '待处理' },
            processing: { color: 'blue', text: '处理中' },
            completed: { color: 'green', text: '已完成' },
            cancelled: { color: 'red', text: '已取消' },
          };
          return map[row.status] || { color: '', text: row.status };
        },
      },
    },
    formProps: {
      component: 'Select', rules: 'required',
      componentProps: {
        options: [{ label: '待处理', value: 'pending' }, { label: '处理中', value: 'processing' }, { label: '已完成', value: 'completed' }, { label: '已取消', value: 'cancelled' }],
      },
    },
  },
  { fieldName: 'remark', label: '备注', dataType: 'text', tableProps: { minWidth: 120 } },
  { fieldName: 'createdAt', label: '创建时间', dataType: 'timestamp', hideInForm: true },
];
