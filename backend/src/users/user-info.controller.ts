import { Controller, Get, UseGuards, NotFoundException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PrismaService } from '../common/prisma.service';

@UseGuards(AuthGuard('jwt'))
@Controller('user')
export class UserInfoController {
  constructor(private prisma: PrismaService) {}

  @Get('info')
  async getInfo(@CurrentUser('id') userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        realName: true,
        avatar: true,
        status: true,
        roles: { include: { role: { select: { code: true } } } },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return {
      userId: String(user.id),
      username: user.username,
      realName: user.realName || user.username,
      avatar: user.avatar || '',
      roles: user.roles.map((r) => r.role.code),
      desc: '',
      homePath: '/dashboard/analytics',
    };
  }
}
