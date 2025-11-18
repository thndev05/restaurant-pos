import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { PrismaModule } from './config/prisma/prisma.module';
import { MenuItemsModule } from './modules/menu-items/menu-items.module';
import { CloudinaryModule } from './config/cloudinary/cloudinary.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TablesModule } from './modules/tables/tables.module';
import { CustomersModule } from './modules/customers/customers.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { PermissionsGuard } from './modules/auth/guards/permissions.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    CloudinaryModule,
    AuthModule,
    MenuItemsModule,
    CategoriesModule,
    TablesModule,
    CustomersModule,
    UsersModule,
  ],
  providers: [
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
export class AppModule {}
