import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRED_PERMISSION_KEY } from '../decorators/permission.decorator';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.getAllAndOverride<string>(
      REQUIRED_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('No authenticated user');
    }

    const [userPermissions, rolePermissions] = await Promise.all([
      this.prisma.userPermission.findMany({
        where: { userId: user.id },
        include: { permission: true },
      }),
      this.prisma.rolePermission.findMany({
        where: {
          role: {
            users: { some: { userId: user.id } },
            status: 1,
            deletedAt: null,
          },
        },
        include: { permission: true },
      }),
    ]);

    const permissionCodes = new Set([
      ...userPermissions.map((item) => item.permission.code),
      ...rolePermissions.map((item) => item.permission.code),
    ]);

    if (!permissionCodes.has(requiredPermission)) {
      throw new ForbiddenException(
        `Missing required permission: ${requiredPermission}`,
      );
    }

    return true;
  }
}
