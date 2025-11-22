import { IsOptional, IsString } from 'class-validator';

export class ProcessPaymentDto {
  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
