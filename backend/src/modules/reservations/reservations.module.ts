import { Module } from '@nestjs/common';
import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { ReservationsSchedulerService } from './reservations-scheduler.service';
import { PrismaModule } from 'src/config/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsSchedulerService],
  exports: [ReservationsService],
})
export class ReservationsModule {}
