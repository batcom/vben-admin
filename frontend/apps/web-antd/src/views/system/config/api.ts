import { requestClient } from '#/api/request';

export interface SysConfigItem {
  id: number;
  group: string;
  group_sort: number;
  key: string;
  label: string;
  value: any;
  default_value: any;
  type: string;
  sort_order: number;
  placeholder: string;
  remark: string;
  created_at: string;
  updated_at: string;
}

export interface ConfigGroup {
  key: string;
  label: string;
  sort: number;
  items: SysConfigItem[];
}

export async function getSystemConfigListApi(params?: any) {
  return requestClient.get('/admin/sys_config', { params });
}

export async function getSystemConfigGroupedApi() {
  const result = await requestClient.get('/admin/sys_config', {
    params: { pageSize: 200 },
  });
  const groups: Record<string, { label: string; items: SysConfigItem[]; sort: number }> = {};
  for (const item of result.items) {
    const g = item.group || 'basic';
    if (!groups[g]) {
      groups[g] = { label: g, items: [], sort: item.group_sort ?? 0 };
    }
    groups[g].items.push(item);
  }
  return Object.entries(groups)
    .sort(([, a], [, b]) => a.sort - b.sort)
    .map(([key, val]) => ({
      key,
      label: CONFIG_GROUP_LABELS[key] || key,
      sort: val.sort,
      items: val.items.sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    }));
}

export async function createSystemConfigApi(data: any) {
  return requestClient.post('/admin/sys_config', data);
}

export async function updateSystemConfigApi(id: number, data: any) {
  return requestClient.put('/admin/sys_config/' + id, data);
}

export async function deleteSystemConfigApi(id: number) {
  return requestClient.delete('/admin/sys_config/' + id);
}

export const CONFIG_TYPE_OPTIONS = [
  { value: 'string', label: '文本 (string)' },
  { value: 'number', label: '数字 (number)' },
  { value: 'boolean', label: '开关 (boolean)' },
  { value: 'textarea', label: '多行文本 (textarea)' },
  { value: 'json', label: 'JSON (json)' },
  { value: 'array', label: '数组 (array)' },
  { value: 'dict', label: '键值字典 (dict)' },
  { value: 'kv2d', label: '二维键值表 (kv2d)' },
];

export const CONFIG_GROUP_LABELS: Record<string, string> = {
  basic: '基本设置',
  app_user_material: '素材设置',
  app_creation: '创作设置',
  app_credit: '积分设置',
  app_voice: '语音设置',
  app_virtual_man: '虚拟人设置',
  app_poster: '海报设置',
  app_music: '音乐设置',
  app_trend: '动态设置',
  app_template: '模板设置',
  app_supplement: '补充管理',
};
