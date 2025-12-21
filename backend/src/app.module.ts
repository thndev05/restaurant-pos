import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from './config/prisma/prisma.module';
import { MenuItemsModule } from './modules/menu-items/menu-items.module';
import { CloudinaryModule } from './config/cloudinary/cloudinary.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TablesModule } from './modules/tables/tables.module';
import { CustomersModule } from './modules/customers/customers.module';
import { SessionsModule } from './modules/sessions/sessions.module';
import { OrdersModule } from './modules/orders/orders.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { ActionsModule } from './modules/actions/actions.module';
import { KitchenModule } from './modules/kitchen/kitchen.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { PermissionsGuard } from './modules/auth/guards/permissions.guard';
import { LoggerMiddleware } from './common/middleware/logger.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 50, // 50 requests per minute (for staff only endpoints)
      },
    ]),
    ScheduleModule.forRoot(),
    PrismaModule,
    CloudinaryModule,
    AuthModule,
    MenuItemsModule,
    CategoriesModule,
    TablesModule,
    CustomersModule,
    SessionsModule,
    OrdersModule,
    PaymentsModule,
    UsersModule,
    RolesModule,
    ActionsModule,
    KitchenModule,
    ReservationsModule,
  ],
  providers: [
    // Global throttler guard for rate limiting
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    // Global guards for RBAC
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => new JwtAuthGuard(reflector),
      inject: [Reflector],
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: PermissionsGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
