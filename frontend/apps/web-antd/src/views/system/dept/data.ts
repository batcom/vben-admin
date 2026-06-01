import type { CrudField } from '#/composables/use-crud-schema';

export const deptFields: CrudField[] = [
  { fieldName: 'id', label: 'ID', dataType: 'int4', hideInSearch: true, hideInForm: true },
  { fieldName: 'parentId', label: '上级部门', dataType: 'int4', hideInSearch: true, hideInTable: true,
    formProps: { component: 'InputNumber', componentProps: { placeholder: '留空为顶级' } } },
  { fieldName: 'name', label: '名称', dataType: 'varchar', tableProps: { minWidth: 140, treeNode: true } },
  { fieldName: 'sortOrder', label: '排序', dataType: 'int4', hideInSearch: true },
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
];
