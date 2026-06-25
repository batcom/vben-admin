import type { RouteRecordRaw } from 'vue-router';

import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    name: 'Profile',
    path: '/profile',
    component: () => import('#/views/_core/profile/index.vue'),
    meta: {
      icon: 'lucide:user',
      hideInMenu: true,
      title: $t('page.auth.profile'),
    },
  },
  {
    name: 'SystemConfig',
    path: '/system/config',
    component: () => import('#/views/system/config/index.vue'),
    meta: {
      icon: 'lucide:settings',
      title: '系统配置',
      hideInMenu: true, // 菜单由后端 menu 表控制
    },
  },
];

export default routes;
