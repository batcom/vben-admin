import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../common/prisma.service';

@UseGuards(AuthGuard('jwt'))
@Controller('menu')
export class MenuAllController {
  constructor(private prisma: PrismaService) {}

  @Get('all')
  async getAll(@CurrentUser('id') userId: number) {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: { include: { menus: { include: { menu: true } } } },
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
      if (menu.component) node.component = menu.component;
      if (menu.redirect) node.redirect = menu.redirect;
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
    return name.replace(/(^\w|-\w|_\w)/g, (m) => m.replace(/[-_]/g, '').toUpperCase());
  }
}
