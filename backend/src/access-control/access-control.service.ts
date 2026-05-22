import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

export const DATA_SCOPE = {
  SELF: '1',
  DEPT: '2',
  DEPT_SUB: '3',
  ALL: '4',
  CUSTOM: '5',
} as const;

@Injectable()
export class AccessControlService {
  constructor(private prisma: PrismaService) {}

  findApiPermissions(query: { keyword?: string; method?: string }) {
    const where: any = {};

    if (query.keyword) {
      where.OR = [
        { name: { contains: query.keyword } },
        { path: { contains: query.keyword } },
      ];
    }
    if (query.method) {
      where.method = query.method.toUpperCase();
    }

    return this.prisma.apiPermission.findMany({
      where,
      orderBy: { id: 'asc' },
    });
  }

  createApiPermission(data: { name: string; method: string; path: string }) {
    return this.prisma.apiPermission.create({
      data: {
        name: data.name,
        method: data.method.toUpperCase(),
        path: data.path,
      },
    });
  }

  async updateApiPermission(
    id: number,
    data: { name?: string; method?: string; path?: string },
  ) {
    await this.ensureApiPermissionExists(id);
    return this.prisma.apiPermission.update({
      where: { id },
      data: {
        name: data.name,
        method: data.method?.toUpperCase(),
        path: data.path,
      },
    });
  }

  async removeApiPermission(id: number) {
    await this.ensureApiPermissionExists(id);
    return this.prisma.apiPermission.delete({ where: { id } });
  }

  findFieldPermissions(query: { tableName?: string; keyword?: string }) {
    const where: any = {};

    if (query.tableName) {
      where.tableName = query.tableName;
    }
    if (query.keyword) {
      where.OR = [
        { tableName: { contains: query.keyword } },
        { fieldName: { contains: query.keyword } },
      ];
    }

    return this.prisma.fieldPermission.findMany({
      where,
      orderBy: [{ tableName: 'asc' }, { fieldName: 'asc' }],
    });
  }

  createFieldPermission(data: { tableName: string; fieldName: string }) {
    return this.prisma.fieldPermission.create({ data });
  }

  async updateRoleFieldPermissions(
    roleId: number,
    fields: Array<{ fieldPermissionId: number; readable: number }>,
  ) {
    await this.ensureRoleExists(roleId);

    return this.prisma.$transaction(async (tx) => {
      await tx.roleFieldPermission.deleteMany({ where: { roleId } });
      if (fields.length > 0) {
        await tx.roleFieldPermission.createMany({
          data: fields.map((field) => ({
            roleId,
            fieldPermissionId: field.fieldPermissionId,
            readable: field.readable,
          })),
          skipDuplicates: true,
        });
      }
      return tx.roleFieldPermission.findMany({
        where: { roleId },
        include: { fieldPermission: true },
      });
    });
  }

  async getRoleFieldPermissions(roleId: number) {
    await this.ensureRoleExists(roleId);
    return this.prisma.roleFieldPermission.findMany({
      where: { roleId },
      include: { fieldPermission: true },
    });
  }

  async getRoleDataScope(roleId: number) {
    await this.ensureRoleExists(roleId);
    return this.prisma.dataScope.findUnique({ where: { roleId } });
  }

  async updateRoleDataScope(
    roleId: number,
    data: { scopeType: string; customDeptIds?: number[] },
  ) {
    await this.ensureRoleExists(roleId);

    return this.prisma.dataScope.upsert({
      where: { roleId },
      update: {
        scopeType: data.scopeType,
        customDeptIds: data.customDeptIds
          ? JSON.stringify(data.customDeptIds)
          : null,
      },
      create: {
        roleId,
        scopeType: data.scopeType,
        customDeptIds: data.customDeptIds
          ? JSON.stringify(data.customDeptIds)
          : null,
      },
    });
  }

  async getReadableFields(userId: number, tableName: string) {
    const hiddenFields = await this.prisma.roleFieldPermission.findMany({
      where: {
        readable: 0,
        fieldPermission: { tableName },
        role: {
          users: { some: { userId } },
          status: 1,
          deletedAt: null,
        },
      },
      include: { fieldPermission: true },
    });

    return hiddenFields.map((item) => item.fieldPermission.fieldName);
  }

  async getDataScopeFilter(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, deptId: true },
    });
    if (!user) return {};

    const scopes = await this.prisma.dataScope.findMany({
      where: {
        role: {
          users: { some: { userId } },
          status: 1,
          deletedAt: null,
        },
      },
    });

    if (scopes.some((scope) => scope.scopeType === DATA_SCOPE.ALL)) {
      return {};
    }

    const deptIds = new Set<number>();
    for (const scope of scopes) {
      if (scope.scopeType === DATA_SCOPE.DEPT && user.deptId) {
        deptIds.add(user.deptId);
      }
      if (scope.scopeType === DATA_SCOPE.CUSTOM && scope.customDeptIds) {
        for (const id of JSON.parse(scope.customDeptIds) as number[]) {
          deptIds.add(id);
        }
      }
    }

    if (deptIds.size > 0) {
      return { deptId: { in: [...deptIds] } };
    }

    return { id: user.id };
  }

  private async ensureRoleExists(id: number) {
    const role = await this.prisma.role.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!role) throw new NotFoundException('Role not found');
  }

  private async ensureApiPermissionExists(id: number) {
    const permission = await this.prisma.apiPermission.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!permission) throw new NotFoundException('API permission not found');
  }
}
