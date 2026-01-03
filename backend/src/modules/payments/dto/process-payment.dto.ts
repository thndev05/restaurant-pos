import { IsOptional, IsString } from 'class-validator';

export class ProcessPaymentDto {
  @IsOptional()
  @IsString()
  notes?: string;
}
