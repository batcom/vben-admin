import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data
  await prisma.userPermission.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.roleApiPermission.deleteMany();
  await prisma.roleFieldPermission.deleteMany();
  await prisma.roleMenu.deleteMany();
  await prisma.dataScope.deleteMany();
  await prisma.userRole.deleteMany();
  await prisma.apiPermission.deleteMany();
  await prisma.fieldPermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.menu.deleteMany();
  await prisma.user.deleteMany();
  await prisma.role.deleteMany();
  await prisma.dept.deleteMany();

  // ---------- Departments ----------
  const deptRoot = await prisma.dept.create({ data: { name: '总公司', sortOrder: 1 } });
  const deptDev = await prisma.dept.create({ data: { name: '技术部', parentId: deptRoot.id, sortOrder: 1 } });
  const deptSales = await prisma.dept.create({ data: { name: '销售部', parentId: deptRoot.id, sortOrder: 2 } });

  // ---------- Admin User ----------
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.create({
    data: {
      username: 'admin',
      password: hashedPassword,
      realName: '系统管理员',
      email: 'admin@example.com',
      phone: '13800000000',
      deptId: deptDev.id,
      status: 1,
    },
  });

  // ---------- Roles ----------
  const roleAdmin = await prisma.role.create({
    data: { name: '超级管理员', code: 'super_admin', description: '拥有所有权限', sortOrder: 1 },
  });
  const roleUser = await prisma.role.create({
    data: { name: '普通用户', code: 'user', description: '普通用户权限', sortOrder: 2 },
  });

  // Assign admin role
  await prisma.userRole.create({ data: { userId: adminUser.id, roleId: roleAdmin.id } });

  // ---------- Menus ----------
  const menuDashboard = await prisma.menu.create({
    data: { name: '仪表板', routeName: 'Dashboard', type: 0, path: '/dashboard', icon: 'lucide:layout-dashboard', sortOrder: 0, redirect: '/dashboard/analytics' },
  });
  const menuAnalytics = await prisma.menu.create({
    data: { name: '分析页', routeName: 'Analytics', type: 1, parentId: menuDashboard.id, path: '/dashboard/analytics', component: '/dashboard/analytics/index', sortOrder: 1 },
  });
  const menuWorkspace = await prisma.menu.create({
    data: { name: '工作台', routeName: 'Workspace', type: 1, parentId: menuDashboard.id, path: '/dashboard/workspace', component: '/dashboard/workspace/index', sortOrder: 2 },
  });
  const menuSystem = await prisma.menu.create({
    data: { name: '系统管理', routeName: 'System', type: 0, path: '/system', icon: 'lucide:settings', sortOrder: 1, redirect: '/system/user' },
  });
  const menuUserMgmt = await prisma.menu.create({
    data: { name: '用户管理', routeName: 'SystemUser', type: 1, parentId: menuSystem.id, path: '/system/user', component: '/system/user/index', sortOrder: 1 },
  });
  const menuRoleMgmt = await prisma.menu.create({
    data: { name: '角色管理', routeName: 'SystemRole', type: 1, parentId: menuSystem.id, path: '/system/role', component: '/system/role/index', sortOrder: 2 },
  });
  const menuMenuMgmt = await prisma.menu.create({
    data: { name: '菜单管理', routeName: 'SystemMenu', type: 1, parentId: menuSystem.id, path: '/system/menu', component: '/system/menu/index', sortOrder: 3 },
  });
  const menuDeptMgmt = await prisma.menu.create({
    data: { name: '部门管理', routeName: 'SystemDept', type: 1, parentId: menuSystem.id, path: '/system/dept', component: '/system/dept/index', sortOrder: 4 },
  });
  const menuOrderMgmt = await prisma.menu.create({
    data: { name: '订单管理', routeName: 'Order', type: 0, path: '/order', icon: 'lucide:shopping-cart', sortOrder: 2, redirect: '/order/list' },
  });
  const menuOrderList = await prisma.menu.create({
    data: { name: '订单列表', routeName: 'OrderList', type: 1, parentId: menuOrderMgmt.id, path: '/order/list', component: '/order/list/index', sortOrder: 1 },
  });
  const menuGenerator = await prisma.menu.create({
    data: { name: '代码生成', routeName: 'Generator', type: 1, parentId: menuSystem.id, path: '/system/generator', component: '/system/generator/index', icon: 'lucide:code', sortOrder: 5 },
  });

  // ---------- Permissions ----------
  const perms = [
    { name: '用户列表', code: 'user:list', menuId: menuUserMgmt.id },
    { name: '用户查询', code: 'user:query', menuId: menuUserMgmt.id },
    { name: '用户新增', code: 'user:create', menuId: menuUserMgmt.id },
    { name: '用户编辑', code: 'user:update', menuId: menuUserMgmt.id },
    { name: '用户删除', code: 'user:delete', menuId: menuUserMgmt.id },
    { name: '角色列表', code: 'role:list', menuId: menuRoleMgmt.id },
    { name: '角色查询', code: 'role:query', menuId: menuRoleMgmt.id },
    { name: '角色新增', code: 'role:create', menuId: menuRoleMgmt.id },
    { name: '角色编辑', code: 'role:update', menuId: menuRoleMgmt.id },
    { name: '角色删除', code: 'role:delete', menuId: menuRoleMgmt.id },
    { name: '菜单列表', code: 'menu:list', menuId: menuMenuMgmt.id },
    { name: '菜单查询', code: 'menu:query', menuId: menuMenuMgmt.id },
    { name: '菜单新增', code: 'menu:create', menuId: menuMenuMgmt.id },
    { name: '菜单编辑', code: 'menu:update', menuId: menuMenuMgmt.id },
    { name: '菜单删除', code: 'menu:delete', menuId: menuMenuMgmt.id },
    { name: '部门列表', code: 'dept:list', menuId: menuDeptMgmt.id },
    { name: '部门查询', code: 'dept:query', menuId: menuDeptMgmt.id },
    { name: '部门新增', code: 'dept:create', menuId: menuDeptMgmt.id },
    { name: '部门编辑', code: 'dept:update', menuId: menuDeptMgmt.id },
    { name: '部门删除', code: 'dept:delete', menuId: menuDeptMgmt.id },
    { name: '权限码列表', code: 'permission:list', menuId: menuMenuMgmt.id },
    { name: '权限码新增', code: 'permission:create', menuId: menuMenuMgmt.id },
    { name: '权限码编辑', code: 'permission:update', menuId: menuMenuMgmt.id },
    { name: '权限码删除', code: 'permission:delete', menuId: menuMenuMgmt.id },
    { name: 'API权限列表', code: 'api-permission:list', menuId: menuMenuMgmt.id },
    { name: 'API权限新增', code: 'api-permission:create', menuId: menuMenuMgmt.id },
    { name: 'API权限编辑', code: 'api-permission:update', menuId: menuMenuMgmt.id },
    { name: 'API权限删除', code: 'api-permission:delete', menuId: menuMenuMgmt.id },
    { name: '字段权限列表', code: 'field-permission:list', menuId: menuMenuMgmt.id },
    { name: '字段权限新增', code: 'field-permission:create', menuId: menuMenuMgmt.id },
    { name: '字段权限编辑', code: 'field-permission:update', menuId: menuMenuMgmt.id },
    { name: '数据权限列表', code: 'data-scope:list', menuId: menuMenuMgmt.id },
    { name: '数据权限编辑', code: 'data-scope:update', menuId: menuMenuMgmt.id },
    { name: '订单列表', code: 'order:list', menuId: menuOrderList.id },
    { name: '订单查询', code: 'order:query', menuId: menuOrderList.id },
    { name: '订单新增', code: 'order:create', menuId: menuOrderList.id },
    { name: '订单编辑', code: 'order:update', menuId: menuOrderList.id },
    { name: '订单删除', code: 'order:delete', menuId: menuOrderList.id },
    { name: '订单导出', code: 'order:export', menuId: menuOrderList.id },
    { name: '代码生成查询', code: 'generator:list', menuId: menuGenerator.id },
    { name: '代码生成执行', code: 'generator:generate', menuId: menuGenerator.id },
  ];

  const createdPerms = [];
  for (const p of perms) {
    createdPerms.push(await prisma.permission.create({ data: p }));
  }

  // Assign all permissions to admin role
  for (const p of createdPerms) {
    await prisma.rolePermission.create({ data: { roleId: roleAdmin.id, permissionId: p.id } });
  }

  // Assign admin menus
  const allMenus = await prisma.menu.findMany();
  for (const m of allMenus) {
    await prisma.roleMenu.create({ data: { roleId: roleAdmin.id, menuId: m.id } });
  }

  // ---------- Data Scope ----------
  await prisma.dataScope.create({
    data: { roleId: roleAdmin.id, scopeType: '4' }, // all data
  });

  // ---------- Sample Orders ----------
  const orderStatuses = ['pending', 'processing', 'completed', 'cancelled'];
  for (let i = 1; i <= 20; i++) {
    await prisma.order.create({
      data: {
        orderNo: `ORD-2026${String(i).padStart(4, '0')}`,
        userId: i % 3 === 0 ? adminUser.id : null,
        totalAmount: (Math.random() * 10000).toFixed(2),
        status: orderStatuses[i % 4],
        remark: i % 5 === 0 ? `测试订单 #${i}` : null,
      },
    });
  }

  console.log('Seed completed successfully!');
  console.log(`Admin user: admin / admin123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
