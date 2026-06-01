import type { CrudField } from '#/composables/use-crud-schema';

export const userFields: CrudField[] = [
  { fieldName: 'id', label: 'ID', dataType: 'int4', hideInSearch: true, hideInForm: true },
  { fieldName: 'username', label: '用户名', dataType: 'varchar' },
  { fieldName: 'password', label: '密码', dataType: 'varchar',
    hideInSearch: true, hideInTable: true,
    formProps: { component: 'InputPassword', rules: 'required' },
  },
  { fieldName: 'realName', label: '真实姓名', dataType: 'varchar' },
  { fieldName: 'email', label: '邮箱', dataType: 'varchar' },
  { fieldName: 'phone', label: '手机', dataType: 'varchar' },
  {
    fieldName: 'status', label: '状态', dataType: 'int4',
    searchProps: {
      component: 'Select',
      componentProps: {
        allowClear: true,
        placeholder: '请选择',
        options: [
          { label: '启用', value: '1' },
          { label: '禁用', value: '0' },
        ],
      },
    },
    tableProps: {
      width: 80,
      cellRender: {
        name: 'CellTag',
        props: ({ row }: any) => ({
          color: row.status === 1 ? 'green' : 'red',
          text: row.status === 1 ? '启用' : '禁用',
        }),
      },
    },
    formProps: {
      component: 'Select',
      rules: 'required',
      componentProps: {
        options: [
          { label: '启用', value: 1 },
          { label: '禁用', value: 0 },
        ],
      },
    },
  },
  { fieldName: 'createdAt', label: '创建时间', dataType: 'timestamp', hideInForm: true },
];
