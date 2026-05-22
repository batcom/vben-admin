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

    const filtered = allMenus.filter((m) => menuIds.has(m.id));
    return this.buildRouteTree(filtered);
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
    routeName?: string;
    type?: number;
    path?: string;
    component?: string;
    redirect?: string;
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
        routeName: data.routeName,
        type: data.type ?? 0,
        path: data.path,
        component: data.component,
        redirect: data.redirect,
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

  private buildRouteTree(menus: any[]) {
    const map = new Map<number, any>();
    const tree: any[] = [];

    for (const menu of menus) {
      const routeName = menu.routeName || this.toPascalCase(menu.name);
      const node: any = {
        path: menu.path || '',
        name: routeName,
        meta: {
          title: menu.name,
          icon: menu.icon || undefined,
          order: menu.sortOrder,
          hideInMenu: menu.show === 0 ? true : undefined,
          keepAlive: menu.keepAlive === 1 ? true : undefined,
        },
      };
      if (menu.component) {
        node.component = menu.component;
      }
      if (menu.redirect) {
        node.redirect = menu.redirect;
      }
      node.children = [];
      map.set(menu.id, node);
    }

    for (const menu of menus) {
      const node = map.get(menu.id);
      if (menu.parentId && map.has(menu.parentId)) {
        map.get(menu.parentId)!.children.push(node);
      } else if (!menu.parentId) {
        tree.push(node);
      }
    }

    // Remove empty children arrays on leaf nodes
    const clean = (nodes: any[]) => {
      for (const n of nodes) {
        if (n.children.length === 0) {
          delete n.children;
        } else {
          clean(n.children);
        }
      }
    };
    clean(tree);

    return tree;
  }

  private toPascalCase(name: string): string {
    return name
      .replace(/[一-龥]/g, '') // remove Chinese chars
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join('') || 'Route';
  }
}
