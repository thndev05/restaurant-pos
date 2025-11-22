import { IsEnum } from 'class-validator';
import { OrderItemStatus } from 'src/generated/prisma';

export class UpdateOrderItemStatusDto {
  @IsEnum(OrderItemStatus)
  status: OrderItemStatus;
}
