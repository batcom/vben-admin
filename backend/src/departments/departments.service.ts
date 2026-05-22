import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class DepartmentsService {
  constructor(private prisma: PrismaService) {}

  async findTree(query: { keyword?: string; status?: number }) {
    const where: any = { deletedAt: null };

    if (query.keyword) {
      where.name = { contains: query.keyword };
    }
    if (query.status !== undefined) {
      where.status = query.status;
    }

    const depts = await this.prisma.dept.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
    });

    return this.buildTree(depts);
  }

  async findOne(id: number) {
    const dept = await this.prisma.dept.findFirst({
      where: { id, deletedAt: null },
      include: { parent: true, children: true },
    });

    if (!dept) throw new NotFoundException('Department not found');
    return dept;
  }

  async create(data: {
    parentId?: number;
    name: string;
    sortOrder?: number;
    status?: number;
  }) {
    return this.prisma.dept.create({
      data: {
        parentId: data.parentId,
        name: data.name,
        sortOrder: data.sortOrder ?? 0,
        status: data.status ?? 1,
      },
    });
  }

  async update(
    id: number,
    data: {
      parentId?: number | null;
      name?: string;
      sortOrder?: number;
      status?: number;
    },
  ) {
    await this.ensureExists(id);
    return this.prisma.dept.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.ensureExists(id);

    const child = await this.prisma.dept.findFirst({
      where: { parentId: id, deletedAt: null },
      select: { id: true },
    });
    if (child) {
      throw new NotFoundException('Department has child departments');
    }

    return this.prisma.dept.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async ensureExists(id: number) {
    const dept = await this.prisma.dept.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!dept) throw new NotFoundException('Department not found');
  }

  private buildTree(depts: any[]) {
    const map = new Map<number, any>();
    const tree: any[] = [];

    for (const dept of depts) {
      map.set(dept.id, { ...dept, children: [] });
    }

    for (const dept of depts) {
      const node = map.get(dept.id);
      if (dept.parentId && map.has(dept.parentId)) {
        map.get(dept.parentId).children.push(node);
      } else if (!dept.parentId) {
        tree.push(node);
      }
    }

    return tree;
  }
}
