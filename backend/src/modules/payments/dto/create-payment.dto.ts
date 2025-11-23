import {
  IsDecimal,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaymentMethod } from 'src/generated/prisma/enums';

export class CreatePaymentDto {
  @IsUUID()
  sessionId: string;

  @IsDecimal()
  totalAmount: string;

  @IsDecimal()
  subTotal: string;

  @IsOptional()
  @IsDecimal()
  tax?: string;

  @IsOptional()
  @IsDecimal()
  discount?: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @IsOptional()
  @IsString()
  notes?: string;
}
