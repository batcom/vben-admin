import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  async getAllMenus(userId: number) {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            menus: { include: { menu: true } },
          },
        },
      },
    });

    const menuIds = new Set<number>();
    for (const ur of userRoles) {
      for (const rm of ur.role.menus) {
        menuIds.add(rm.menuId);
      }
    }

    const allMenus = await this.prisma.menu.findMany({
      where: { deletedAt: null, status: 1, show: 1 },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });

    return this.buildTree(allMenus.filter((m) => menuIds.has(m.id)));
  }

  async findTree(query: { keyword?: string; status?: number }) {
    const where: any = { deletedAt: null };

    if (query.keyword) {
      where.name = { contains: query.keyword };
    }
    if (query.status !== undefined) {
      where.status = query.status;
    }

    const menus = await this.prisma.menu.findMany({
      where,
      include: { permissions: true },
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });

    return this.buildTree(menus);
  }

  async findOne(id: number) {
    const menu = await this.prisma.menu.findFirst({
      where: { id, deletedAt: null },
      include: { parent: true, children: true, permissions: true },
    });

    if (!menu) throw new NotFoundException('Menu not found');
    return menu;
  }

  async create(data: {
    parentId?: number;
    name: string;
    type?: number;
    path?: string;
    component?: string;
    icon?: string;
    sortOrder?: number;
    perms?: string;
    status?: number;
    keepAlive?: number;
    show?: number;
  }) {
    return this.prisma.menu.create({
      data: {
        parentId: data.parentId,
        name: data.name,
        type: data.type ?? 0,
        path: data.path,
        component: data.component,
        icon: data.icon,
        sortOrder: data.sortOrder ?? 0,
        perms: data.perms,
        status: data.status ?? 1,
        keepAlive: data.keepAlive ?? 1,
        show: data.show ?? 1,
      },
    });
  }

  async update(id: number, data: any) {
    await this.ensureExists(id);
    return this.prisma.menu.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.ensureExists(id);

    const child = await this.prisma.menu.findFirst({
      where: { parentId: id, deletedAt: null },
      select: { id: true },
    });
    if (child) {
      throw new NotFoundException('Menu has child menus');
    }

    return this.prisma.menu.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async ensureExists(id: number) {
    const menu = await this.prisma.menu.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!menu) throw new NotFoundException('Menu not found');
  }

  private buildTree(menus: any[]) {
    const map = new Map<number, any>();
    const tree: any[] = [];

    for (const menu of menus) {
      map.set(menu.id, { ...menu, children: [] });
    }

    for (const menu of menus) {
      const node = map.get(menu.id);
      if (menu.parentId && map.has(menu.parentId)) {
        map.get(menu.parentId).children.push(node);
      } else if (!menu.parentId) {
        tree.push(node);
      }
    }

    return tree;
  }
}
