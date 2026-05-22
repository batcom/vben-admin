import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: number;
  }) {
    const { page = 1, pageSize = 10, keyword, status } = query;
    const where: any = { deletedAt: null };

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { code: { contains: keyword } },
      ];
    }
    if (status !== undefined) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.role.findMany({
        where,
        include: {
          menus: { select: { menuId: true } },
          permissions: { select: { permissionId: true } },
          dataScope: true,
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.role.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const role = await this.prisma.role.findFirst({
      where: { id, deletedAt: null },
      include: {
        menus: { select: { menuId: true } },
        permissions: { select: { permissionId: true } },
        apiPerms: { select: { apiPermissionId: true } },
        fieldPerms: {
          include: { fieldPermission: true },
        },
        dataScope: true,
      },
    });

    if (!role) throw new NotFoundException('Role not found');
    return role;
  }

  async create(data: {
    name: string;
    code: string;
    description?: string;
    status?: number;
    sortOrder?: number;
    menuIds?: number[];
    permissionIds?: number[];
  }) {
    return this.prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          name: data.name,
          code: data.code,
          description: data.description,
          status: data.status ?? 1,
          sortOrder: data.sortOrder ?? 0,
        },
      });

      await this.syncRoleMenus(tx, role.id, data.menuIds ?? []);
      await this.syncRolePermissions(tx, role.id, data.permissionIds ?? []);

      return this.findOne(role.id);
    });
  }

  async update(
    id: number,
    data: {
      name?: string;
      code?: string;
      description?: string;
      status?: number;
      sortOrder?: number;
      menuIds?: number[];
      permissionIds?: number[];
    },
  ) {
    await this.ensureExists(id);

    return this.prisma.$transaction(async (tx) => {
      await tx.role.update({
        where: { id },
        data: {
          name: data.name,
          code: data.code,
          description: data.description,
          status: data.status,
          sortOrder: data.sortOrder,
        },
      });

      if (data.menuIds) {
        await this.syncRoleMenus(tx, id, data.menuIds);
      }
      if (data.permissionIds) {
        await this.syncRolePermissions(tx, id, data.permissionIds);
      }

      return this.findOne(id);
    });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.role.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async ensureExists(id: number) {
    const role = await this.prisma.role.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!role) throw new NotFoundException('Role not found');
  }

  private async syncRoleMenus(tx: any, roleId: number, menuIds: number[]) {
    await tx.roleMenu.deleteMany({ where: { roleId } });
    if (menuIds.length > 0) {
      await tx.roleMenu.createMany({
        data: menuIds.map((menuId) => ({ roleId, menuId })),
        skipDuplicates: true,
      });
    }
  }

  private async syncRolePermissions(
    tx: any,
    roleId: number,
    permissionIds: number[],
  ) {
    await tx.rolePermission.deleteMany({ where: { roleId } });
    if (permissionIds.length > 0) {
      await tx.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
        skipDuplicates: true,
      });
    }
  }
}
