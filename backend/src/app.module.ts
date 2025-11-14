import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './config/prisma/prisma.module';
import { MenuItemsModule } from './modules/menu-items/menu-items.module';
import { CloudinaryModule } from './config/cloudinary/cloudinary.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TablesModule } from './modules/tables/tables.module';
import { CustomersModule } from './modules/customers/customers.module';
import { AuthModule } from './modules/auth/auth.module';

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
  ],
})
export class AppModule {}
