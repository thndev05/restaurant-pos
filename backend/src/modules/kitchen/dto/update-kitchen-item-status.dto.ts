import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { OrderItemStatus } from 'src/generated/prisma';

export class UpdateKitchenItemStatusDto {
  @IsEnum(OrderItemStatus)
  status: OrderItemStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
