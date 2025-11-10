import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './config/prisma/prisma.module';
import { MenuItemsModule } from './modules/menu-items/menu-items.module';
import { CloudinaryModule } from './config/cloudinary/cloudinary.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TablesService } from './modules/tables/tables.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    CloudinaryModule,
    MenuItemsModule,
    CategoriesModule,
    TablesService,
  ],
})
export class AppModule {}
