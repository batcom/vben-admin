import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AccessControlModule } from './access-control/access-control.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './common/config.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionGuard } from './common/guards/permission.guard';
import { PrismaModule } from './common/prisma.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { DepartmentsModule } from './departments/departments.module';
import { GeneratorModule } from './generator/generator.module';
import { MenusModule } from './menus/menus.module';
import { OrdersModule } from './orders/orders.module';
import { PermissionsModule } from './permissions/permissions.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    MenusModule,
    RolesModule,
    PermissionsModule,
    DepartmentsModule,
    AccessControlModule,
    OrdersModule,
    DashboardModule,
    GeneratorModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionGuard,
    },
  ],
})
export class AppModule {}
