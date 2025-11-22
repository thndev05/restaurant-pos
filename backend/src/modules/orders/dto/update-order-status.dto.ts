import { IsEnum } from 'class-validator';
import { OrderStatus } from 'src/generated/prisma';

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}
