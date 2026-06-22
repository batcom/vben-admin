import { requestClient } from '#/api/request';

export async function getSystemConfigListApi(params?: any) {
  return requestClient.get('/admin/sys_config', { params });
}

export async function getSystemConfigGroupedApi() {
  // Fetch all configs (no pagination) and group by `group` on the frontend
  const result = await requestClient.get('/admin/sys_config', {
    params: { pageSize: 200 },
  });
  // Group and sort by group_sort
  const groups: Record<string, { label: string; items: any[]; sort: number }> = {};
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
      items: val.items.sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    }));
}

export async function updateSystemConfigApi(id: number, data: any) {
  return requestClient.put('/admin/sys_config/' + id, data);
}

export async function getSystemConfigDetailApi(id: number) {
  return requestClient.get('/admin/sys_config/' + id);
}

const CONFIG_GROUP_LABELS: Record<string, string> = {
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
