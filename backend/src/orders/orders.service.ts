import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    pageSize?: number;
    keyword?: string;
    status?: string;
  }) {
    const { page = 1, pageSize = 10, keyword, status } = query;
    const where: any = { deletedAt: null };

    if (keyword) {
      where.OR = [
        { orderNo: { contains: keyword } },
        { remark: { contains: keyword } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        include: { user: { select: { id: true, username: true, realName: true } } },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const order = await this.prisma.order.findFirst({
      where: { id, deletedAt: null },
      include: { user: { select: { id: true, username: true, realName: true } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(data: {
    orderNo: string;
    userId?: number;
    totalAmount: number;
    status?: string;
    remark?: string;
  }) {
    return this.prisma.order.create({
      data: {
        orderNo: data.orderNo,
        userId: data.userId,
        totalAmount: data.totalAmount,
        status: data.status ?? 'pending',
        remark: data.remark,
      },
    });
  }

  async update(id: number, data: any) {
    await this.ensureExists(id);
    return this.prisma.order.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.ensureExists(id);
    return this.prisma.order.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private async ensureExists(id: number) {
    const order = await this.prisma.order.findFirst({
      where: { id, deletedAt: null },
      select: { id: true },
    });
    if (!order) throw new NotFoundException('Order not found');
  }
}
