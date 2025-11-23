import {
  IsArray,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
  IsInt,
  Min,
  IsEnum,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType } from 'src/generated/prisma';

export class CreateOrderItemDto {
  @IsUUID()
  menuItemId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateOrderDto {
  @IsEnum(OrderType)
  orderType: OrderType;

  @ValidateIf((o: CreateOrderDto) => o.orderType === OrderType.DINE_IN)
  @IsNotEmpty()
  @IsUUID()
  sessionId?: string;

  @ValidateIf((o: CreateOrderDto) => o.orderType === OrderType.TAKE_AWAY)
  @IsNotEmpty()
  @IsString()
  customerName?: string;

  @ValidateIf((o: CreateOrderDto) => o.orderType === OrderType.TAKE_AWAY)
  @IsNotEmpty()
  @IsString()
  customerPhone?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items: CreateOrderItemDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
