import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class FieldpermissionService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; pageSize?: number; keyword?: string }) {
    const { page = 1, pageSize = 10, keyword } = query;
    const where: any = {};

    if (keyword) {
      where.OR = [
        { tableName: { contains: keyword } },
        { fieldName: { contains: keyword } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.fieldPermission.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.fieldPermission.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const record = await this.prisma.fieldPermission.findFirst({
      where: { id },
    });
    if (!record) throw new NotFoundException('Fieldpermission not found');
    return record;
  }

  async create(data: {
    tableName: string;
    fieldName: string;
  }) {
    return this.prisma.fieldPermission.create({ data });
  }

  async update(id: number, data: any) {
    await this.ensureExists(id);
    return this.prisma.fieldPermission.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.fieldPermission.delete({ where: { id } });
  }

  private async ensureExists(id: number) {
    const record = await this.prisma.fieldPermission.findFirst({
      where: { id },
      select: { id: true },
    });
    if (!record) throw new NotFoundException('Fieldpermission not found');
  }
}
