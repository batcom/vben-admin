import {
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    @Inject('CONFIG') private config: any,
  ) {}

  async login(username: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true, username: true, realName: true, password: true, avatar: true, email: true, phone: true },
    });

    if (!user) {
      throw new UnauthorizedException('Username or password is incorrect');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Username or password is incorrect');
    }

    const tokens = await this.generateTokens(user.id, user.username);

    return {
      ...tokens,
      id: user.id,
      username: user.username,
      realName: user.realName,
      avatar: user.avatar,
      email: user.email,
      phone: user.phone,
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.config.jwt.refreshSecret,
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, username: true, status: true },
      });

      if (!user || user.status === 0) {
        throw new UnauthorizedException('User is disabled');
      }

      return this.generateTokens(user.id, user.username);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async getPermissions(userId: number) {
    const [userPermissions, rolePermissions] = await Promise.all([
      this.prisma.userPermission.findMany({
        where: { userId },
        include: { permission: true },
      }),
      this.prisma.rolePermission.findMany({
        where: {
          role: {
            users: { some: { userId } },
            status: 1,
            deletedAt: null,
          },
        },
        include: { permission: true },
      }),
    ]);

    return [
      ...new Set([
        ...userPermissions.map((item) => item.permission.code),
        ...rolePermissions.map((item) => item.permission.code),
      ]),
    ];
  }

  private async generateTokens(userId: number, username: string) {
    const payload = { sub: userId, username };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.config.jwt.secret,
        expiresIn: this.config.jwt.expiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: this.config.jwt.refreshSecret,
        expiresIn: this.config.jwt.refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
