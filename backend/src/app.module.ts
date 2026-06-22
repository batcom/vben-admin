import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AccessControlModule } from './access-control/access-control.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from './common/config.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionGuard } from './common/guards/permission.guard';
import { PrismaModule } from './common/prisma.module';
import { CrudModule } from './crud/crud.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { GeneratorModule } from './generator/generator.module';
import { OrdersModule } from './orders/orders.module';
import { SiteConfigModule } from './config/config.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    AuthModule,
    DashboardModule,
    GeneratorModule,
    OrdersModule,
    SiteConfigModule,
    AccessControlModule,
    CrudModule.forRoot({
      apps: [
        {
          name: 'admin',
          prefix: 'admin',
          guard: JwtAuthGuard,
          entities: {},
          autoScan: true,
        },
      ],
    }),
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
