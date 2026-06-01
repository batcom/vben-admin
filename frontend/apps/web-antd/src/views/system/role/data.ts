import type { CrudField } from '#/composables/use-crud-schema';

export const roleFields: CrudField[] = [
  { fieldName: 'id', label: 'ID', dataType: 'int4', hideInSearch: true, hideInForm: true },
  { fieldName: 'name', label: '名称', dataType: 'varchar' },
  { fieldName: 'code', label: '编码', dataType: 'varchar' },
  { fieldName: 'description', label: '描述', dataType: 'varchar' },
  { fieldName: 'sortOrder', label: '排序', dataType: 'int4', hideInSearch: true, hideInTable: true },
  {
    fieldName: 'status', label: '状态', dataType: 'int4',
    searchProps: {
      component: 'Select',
      componentProps: { allowClear: true, placeholder: '请选择', options: [{ label: '启用', value: '1' }, { label: '禁用', value: '0' }] },
    },
    tableProps: {
      width: 80,
      cellRender: { name: 'CellTag', props: ({ row }: any) => ({ color: row.status === 1 ? 'green' : 'red', text: row.status === 1 ? '启用' : '禁用' }) },
    },
    formProps: {
      component: 'Select', rules: 'required',
      componentProps: { options: [{ label: '启用', value: 1 }, { label: '禁用', value: 0 }] },
    },
  },
  { fieldName: 'createdAt', label: '创建时间', dataType: 'timestamp', hideInForm: true },
];
