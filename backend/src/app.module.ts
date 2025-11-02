import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { MenuItemsModule } from './modules/menu-items/menu-items.module';

@Module({
  imports: [
    PrismaModule,
    MenuItemsModule,
  ],
})
export class AppModule {}
