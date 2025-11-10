import { Module } from '@nestjs/common';
import { TablesService } from './tables.service';
import { TablesController } from './tables.controller';
import { PrismaModule } from 'src/config/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TablesController],
  providers: [TablesService],
})
export class TablesModule {}
