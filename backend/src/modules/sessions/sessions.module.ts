import { Module } from '@nestjs/common';
import { SessionsController } from './sessions.controller';
import { SessionsService } from './sessions.service';
import { PrismaModule } from 'src/config/prisma/prisma.module';
import { TablesModule } from '../tables/tables.module';

@Module({
  imports: [PrismaModule, TablesModule],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [SessionsService],
})
export class SessionsModule {}
