import type { CrudField } from '#/composables/use-crud-schema';

export const menuFields: CrudField[] = [
  { fieldName: 'id', label: 'ID', dataType: 'int4', hideInSearch: true, hideInForm: true, hideInTable: true },
  { fieldName: 'parentId', label: '上级菜单', dataType: 'int4', hideInSearch: true, hideInTable: true,
    formProps: { component: 'InputNumber', componentProps: { placeholder: '留空为顶级' } } },
  { fieldName: 'name', label: '名称', dataType: 'varchar',
    tableProps: { minWidth: 120, treeNode: true } },
  { fieldName: 'routeName', label: '路由名', dataType: 'varchar', tableProps: { minWidth: 100 } },
  { fieldName: 'path', label: '路径', dataType: 'varchar', tableProps: { minWidth: 140 } },
  { fieldName: 'redirect', label: '重定向', dataType: 'varchar', hideInSearch: true, hideInTable: true },
  { fieldName: 'component', label: '组件', dataType: 'varchar', tableProps: { minWidth: 160 } },
  { fieldName: 'icon', label: '图标', dataType: 'varchar', hideInSearch: true, hideInTable: true },
  {
    fieldName: 'type', label: '类型', dataType: 'int4',
    searchProps: {
      component: 'Select',
      componentProps: { allowClear: true, placeholder: '请选择', options: [{ label: '目录', value: '0' }, { label: '菜单', value: '1' }, { label: '按钮', value: '2' }] },
    },
    tableProps: {
      width: 70,
      cellRender: {
        name: 'CellTag',
        props: ({ row }: any) => {
          const map: Record<number, { color: string; text: string }> = {
            0: { color: 'blue', text: '目录' },
            1: { color: 'green', text: '菜单' },
            2: { color: 'orange', text: '按钮' },
          };
          return map[row.type] || { color: '', text: String(row.type) };
        },
      },
    },
    formProps: {
      component: 'Select', rules: 'required',
      componentProps: { options: [{ label: '目录', value: 0 }, { label: '菜单', value: 1 }, { label: '按钮', value: 2 }] },
    },
  },
  { fieldName: 'perms', label: '权限标识', dataType: 'varchar', tableProps: { minWidth: 120 } },
  { fieldName: 'sortOrder', label: '排序', dataType: 'int4', tableProps: { width: 70 }, hideInSearch: true },
  {
    fieldName: 'keepAlive', label: '缓存', dataType: 'int4', hideInSearch: true, hideInTable: true,
    formProps: { component: 'Select', defaultValue: 1, componentProps: { options: [{ label: '是', value: 1 }, { label: '否', value: 0 }] } },
  },
  {
    fieldName: 'show', label: '显示', dataType: 'int4', hideInSearch: true, hideInTable: true,
    formProps: { component: 'Select', defaultValue: 1, componentProps: { options: [{ label: '是', value: 1 }, { label: '否', value: 0 }] } },
  },
  {
    fieldName: 'status', label: '状态', dataType: 'int4',
    searchProps: {
      component: 'Select',
      componentProps: { allowClear: true, placeholder: '请选择', options: [{ label: '启用', value: '1' }, { label: '禁用', value: '0' }] },
    },
    tableProps: {
      width: 70,
      cellRender: { name: 'CellTag', props: ({ row }: any) => ({ color: row.status === 1 ? 'green' : 'red', text: row.status === 1 ? '启用' : '禁用' }) },
    },
    formProps: {
      component: 'Select', rules: 'required',
      componentProps: { options: [{ label: '启用', value: 1 }, { label: '禁用', value: 0 }] },
    },
  },
];
