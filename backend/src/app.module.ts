import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { MenuItemsModule } from './modules/menu-items/menu-items.module';
import { CloudinaryModule } from './config/cloudinary.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    CloudinaryModule,
    MenuItemsModule,
  ],
})
export class AppModule {}
