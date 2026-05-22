import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      userCount,
      orderCount,
      totalAmount,
      pendingOrders,
      recentOrders,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null, status: 1 } }),
      this.prisma.order.count({ where: { deletedAt: null } }),
      this.prisma.order.aggregate({
        where: { deletedAt: null },
        _sum: { totalAmount: true },
      }),
      this.prisma.order.count({
        where: { deletedAt: null, status: 'pending' },
      }),
      this.prisma.order.findMany({
        where: { deletedAt: null },
        include: { user: { select: { realName: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      userCount,
      orderCount,
      totalAmount: totalAmount._sum.totalAmount || 0,
      pendingOrders,
      recentOrders,
    };
  }
}
