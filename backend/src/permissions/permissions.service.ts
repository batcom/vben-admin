import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { keyword?: string; menuId?: number }) {
    const where: any = {};

    if (query.keyword) {
      where.OR = [
        { name: { contains: query.keyword } },
        { code: { contains: query.keyword } },
      ];
    }
    if (query.menuId !== undefined) {
      where.menuId = query.menuId;
    }

    return this.prisma.permission.findMany({
      where,
      orderBy: { id: 'asc' },
    });
  }

  async create(data: { name: string; code: string; menuId?: number }) {
    return this.prisma.permission.create({
      data: {
        name: data.name,
        code: data.code,
        menuId: data.menuId,
      },
    });
  }

  async update(
    id: number,
    data: { name?: string; code?: string; menuId?: number | null },
  ) {
    await this.ensureExists(id);
    return this.prisma.permission.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.permission.delete({ where: { id } });
  }

  private async ensureExists(id: number) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!permission) throw new NotFoundException('Permission not found');
  }
}
