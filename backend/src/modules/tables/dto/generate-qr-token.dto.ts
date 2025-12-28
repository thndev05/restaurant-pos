import { IsUUID, IsString, IsOptional } from 'class-validator';

export class GenerateQrTokenDto {
  @IsUUID()
  tableId: string;

  @IsOptional()
  @IsString()
  branchId?: string;
}

export class QrTokenResponseDto {
  token: string;
  qrCodeUrl: string;
  expiresAt?: Date;
}
