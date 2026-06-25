import type { RouteRecordRaw } from 'vue-router';

// Helper: one-line generic CRUD route
function crud(
  path: string,
  entity: string,
  meta: Record<string, any>,
): RouteRecordRaw {
  // Derive a unique name from path: /system/user → SystemUser
  const name = path
    .split('/')
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
  return {
    path,
    name,
    component: () => import('#/views/common/crud-page.vue'),
    meta: { app: 'admin', entity, ...meta },
  } as unknown as RouteRecordRaw;
}

// Register entities here — one line each
const entities: Array<{ path: string; entity: string; meta: Record<string, any> }> = [
  { path: '/system/user', entity: 'user', meta: { icon: 'lucide:users', title: '用户管理' } },
  { path: '/system/role', entity: 'role', meta: { icon: 'lucide:shield', title: '角色管理' } },
  { path: '/system/dept', entity: 'dept', meta: { icon: 'lucide:building', title: '部门管理' } },
  { path: '/system/menu', entity: 'menu', meta: { icon: 'lucide:menu', title: '菜单管理' } },
  { path: '/order/list', entity: 'order', meta: { icon: 'lucide:shopping-cart', title: '订单列表' } },
  { path: '/cms/article', entity: 'article', meta: { icon: 'lucide:file-text', title: '文章管理' } },
];

// Wrap in a parent route for proper path resolution (no meta = no sidebar menu)
const routes: RouteRecordRaw[] = [
  {
    name: 'SystemAdmin',
    path: '/system',
    children: entities.filter((e) => e.path.startsWith('/system')).map((e) => crud(e.path, e.entity, e.meta)),
  },
  {
    name: 'OrderMgmt',
    path: '/order',
    children: entities.filter((e) => e.path.startsWith('/order')).map((e) => crud(e.path, e.entity, e.meta)),
  },
  {
    name: 'CmsMgmt',
    path: '/cms',
    children: entities.filter((e) => e.path.startsWith('/cms')).map((e) => crud(e.path, e.entity, e.meta)),
  },
];

export default routes;
