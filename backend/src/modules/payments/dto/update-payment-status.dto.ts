import { IsEnum, IsNotEmpty } from 'class-validator';
import { PaymentStatus } from 'src/generated/prisma';

export class UpdatePaymentStatusDto {
  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  status: PaymentStatus;
}
