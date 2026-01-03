import { IsNumber, IsString, IsOptional, IsIn } from 'class-validator';

/**
 * SePay Webhook DTO
 * Data structure received from SePay when a bank transfer occurs
 */
export class SepayWebhookDto {
  @IsNumber()
  id: number; // SePay transaction ID

  @IsString()
  gateway: string; // Bank brand name (e.g., "Vietcombank", "TPBank")

  @IsString()
  transactionDate: string; // Transaction time from bank (e.g., "2023-03-25 14:02:37")

  @IsString()
  accountNumber: string; // Bank account number

  @IsOptional()
  @IsString()
  code: string | null; // Payment code (auto-detected by SePay)

  @IsString()
  content: string; // Transfer content/description

  @IsIn(['in', 'out'])
  transferType: 'in' | 'out'; // "in" for money in, "out" for money out

  @IsNumber()
  transferAmount: number; // Transaction amount

  @IsNumber()
  accumulated: number; // Account balance (accumulated)

  @IsOptional()
  @IsString()
  subAccount: string | null; // Sub-account (virtual account)

  @IsString()
  referenceCode: string; // SMS reference code (e.g., "MBVCB.3278907687")

  @IsString()
  description: string; // Full SMS content
}
