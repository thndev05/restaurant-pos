import { IsOptional, IsEnum, IsString, IsUUID } from 'class-validator';
import { ReservationStatus } from 'src/generated/prisma';

export class GetReservationsDto {
  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  @IsOptional()
  @IsUUID()
  tableId?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;
}
