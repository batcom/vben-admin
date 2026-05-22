import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: { page?: number; pageSize?: number; keyword?: string; status?: number }) {
    const { page = 1, pageSize = 10, keyword, status } = query;
    const where: any = { deletedAt: null };

    if (keyword) {
      where.OR = [
        { username: { contains: keyword } },
        { realName: { contains: keyword } },
        { email: { contains: keyword } },
      ];
    }
    if (status !== undefined) {
      where.status = status;
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          username: true,
          realName: true,
          email: true,
          phone: true,
          avatar: true,
          status: true,
          deptId: true,
          createdAt: true,
          roles: { include: { role: { select: { id: true, name: true } } } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
      select: {
        id: true,
        username: true,
        realName: true,
        email: true,
        phone: true,
        avatar: true,
        status: true,
        deptId: true,
        createdAt: true,
        roles: { include: { role: { select: { id: true, name: true, code: true } } } },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(data: {
    username: string;
    password: string;
    realName?: string;
    email?: string;
    phone?: string;
    deptId?: number;
    status?: number;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        realName: data.realName,
        email: data.email,
        phone: data.phone,
        deptId: data.deptId,
        status: data.status ?? 1,
      },
      select: { id: true, username: true, realName: true, email: true, createdAt: true },
    });
  }

  async update(
    id: number,
    data: {
      realName?: string;
      email?: string;
      phone?: string;
      avatar?: string;
      status?: number;
      deptId?: number;
      password?: string;
    },
  ) {
    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundException('User not found');

    const updateData: any = { ...data };
    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    } else {
      delete updateData.password;
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, username: true, realName: true, email: true, phone: true, status: true },
    });
  }

  async remove(id: number) {
    const user = await this.prisma.user.findFirst({ where: { id, deletedAt: null } });
    if (!user) throw new NotFoundException('User not found');

    // Soft delete
    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
